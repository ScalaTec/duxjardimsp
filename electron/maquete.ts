import { BrowserWindow, WebContentsView, net, session } from 'electron';
import {
  BACKGROUND,
  MAQUETE_HANG_TIMEOUT_MS,
  MAQUETE_LOAD_TIMEOUT_MS,
  MAQUETE_PARTITION,
  MAQUETE_URL,
  NET_POLL_MS,
  RETRY_ERROR_MS,
  RETRY_OFFLINE_MS,
} from './config';
import { log } from './logger';

export type MaqueteStatus = 'idle' | 'loading' | 'ready' | 'offline' | 'error';

export interface MaqueteState {
  status: MaqueteStatus;
  online: boolean;
  attempt: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Posicao "estacionada": a view segue viva (e carregando), mas fora da tela. */
const PARKED: Bounds = { x: -6000, y: 0, width: 1280, height: 720 };

/** Codigos de rede do Chromium que indicam falta de conexao. */
const OFFLINE_CODES = new Set([-106, -105, -109, -130, -137]);

const origin = (url: string): string | null => {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

/**
 * Prepara a Maquete Virtual em segundo plano, isolada do resto do app:
 * uma WebContentsView propria (sandbox, sem preload, particao propria) que
 * nunca pode travar nem derrubar a janela principal. Qualquer falha (offline,
 * DNS, timeout, HTTP, certificado, crash do renderer) vira um estado simples
 * que a interface DUX apresenta com "Tentar novamente".
 */
export class MaqueteService {
  private view: WebContentsView | null = null;
  /** Ultimo valor visto de net.isOnline(): so as mudancas dele disparam nova preparacao. */
  private netOnline = net.isOnline();
  private state: MaqueteState = { status: 'idle', online: this.netOnline, attempt: 0 };
  private visible = false;
  private bounds: Bounds | null = null;
  private lastHttp = 0;
  private started = false;
  private disposed = false;
  private loadTimer?: NodeJS.Timeout;
  private retryTimer?: NodeJS.Timeout;
  private hangTimer?: NodeJS.Timeout;
  private netTimer?: NodeJS.Timeout;

  constructor(
    private readonly win: BrowserWindow,
    private readonly onInput: (e: Electron.Event, input: Electron.Input) => void,
  ) {
    session.fromPartition(MAQUETE_PARTITION).setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
  }

  /** Chamado quando a Home esta pronta; idempotente. */
  start(): void {
    if (this.started || this.disposed) return;
    this.started = true;
    this.netTimer = setInterval(() => this.checkNetwork(), NET_POLL_MS);
    this.prepare();
  }

  getState(): MaqueteState {
    return this.state;
  }

  show(bounds: Bounds): MaqueteState {
    this.visible = true;
    this.bounds = bounds;
    this.place();
    if (this.state.status === 'ready' && this.view) {
      this.view.webContents.setAudioMuted(false);
      this.view.webContents.focus();
    }
    return this.state;
  }

  setBounds(bounds: Bounds): void {
    this.bounds = bounds;
    if (this.visible) this.place();
  }

  hide(): void {
    this.visible = false;
    this.place();
    this.view?.webContents.setAudioMuted(true);
    if (!this.win.isDestroyed()) this.win.webContents.focus();
  }

  /** "Tentar novamente": recria a view do zero, sem reiniciar o app. */
  retry(): MaqueteState {
    log('info', 'maquete: nova tentativa solicitada');
    this.prepare(false);
    return this.state;
  }

  dispose(): void {
    this.disposed = true;
    this.clearTimers();
    if (this.netTimer) clearInterval(this.netTimer);
    this.destroyView();
  }

  // ---------------------------------------------------------------- interno

  private set(patch: Partial<MaqueteState>): void {
    const next = { ...this.state, ...patch };
    const changed = next.status !== this.state.status || next.online !== this.state.online;
    this.state = next;
    if (changed && !this.win.isDestroyed() && !this.win.webContents.isDestroyed()) {
      this.win.webContents.send('maquete:state', this.state);
    }
  }

  private clearTimers(): void {
    for (const t of [this.loadTimer, this.retryTimer, this.hangTimer]) if (t) clearTimeout(t);
    this.loadTimer = this.retryTimer = this.hangTimer = undefined;
  }

  private destroyView(): void {
    const view = this.view;
    this.view = null;
    if (!view) return;
    try {
      if (!this.win.isDestroyed()) this.win.contentView.removeChildView(view);
      if (!view.webContents.isDestroyed()) view.webContents.close({ waitForBeforeUnload: false });
    } catch (e) {
      log('warn', 'maquete: falha ao destruir a view', String(e));
    }
  }

  /** Mostra a view no palco somente quando pronta; senao a estaciona fora da tela. */
  private place(): void {
    if (!this.view || this.win.isDestroyed()) return;
    const onScreen = this.visible && this.state.status === 'ready' && this.bounds;
    const b = onScreen ? this.bounds! : PARKED;
    this.view.setBounds({
      x: Math.round(b.x),
      y: Math.round(b.y),
      width: Math.max(1, Math.round(b.width)),
      height: Math.max(1, Math.round(b.height)),
    });
    this.view.setVisible(true);
  }

  /**
   * `visible=false` (tentativa automatica em segundo plano) nao troca o fallback
   * pelo loader: quem esta olhando a mensagem nao ve a tela piscar.
   */
  private prepare(visible = true): void {
    if (this.disposed || this.win.isDestroyed()) return;
    this.clearTimers();
    this.destroyView();

    this.netOnline = net.isOnline();
    if (!this.netOnline) {
      log('info', 'maquete: sem conexao; aguardando');
      this.set({ status: 'offline', online: false });
      this.scheduleRetry(RETRY_OFFLINE_MS);
      return;
    }

    this.lastHttp = 0;
    const emAlerta = this.state.status === 'offline' || this.state.status === 'error';
    this.state.attempt += 1;
    if (visible || !emAlerta) this.set({ status: 'loading', online: true });

    const view = new WebContentsView({
      webPreferences: {
        partition: MAQUETE_PARTITION,
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        backgroundThrottling: false,
        spellcheck: false,
      },
    });
    this.view = view;
    try {
      view.setBackgroundColor(BACKGROUND);
      view.setBorderRadius?.(32);
    } catch {
      /* APIs opcionais */
    }
    this.win.contentView.addChildView(view);
    this.place();
    this.wire(view);

    this.loadTimer = setTimeout(() => this.fail(view, 'timeout', 'tempo limite ao carregar'), MAQUETE_LOAD_TIMEOUT_MS);
    log('info', `maquete: carregando ${MAQUETE_URL} (tentativa ${this.state.attempt})`);
    view.webContents.loadURL(MAQUETE_URL).catch(() => {
      /* did-fail-load trata o erro */
    });
  }

  private wire(view: WebContentsView): void {
    const wc = view.webContents;
    const current = () => this.view === view && !this.disposed;
    const allowed = origin(MAQUETE_URL);

    wc.setWindowOpenHandler(() => ({ action: 'deny' }));
    wc.setAudioMuted(true);

    wc.on('will-navigate', (e, url) => {
      if (origin(url) !== allowed) {
        e.preventDefault();
        log('warn', `maquete: navegacao externa bloqueada ${url}`);
      }
    });
    wc.on('did-navigate', (_e, _url, code) => {
      if (current()) this.lastHttp = code;
    });
    wc.on('did-fail-load', (_e, code, desc, url, isMainFrame) => {
      if (!current() || !isMainFrame || code === -3) return; // -3 = abortado (navegacao substituida)
      this.fail(view, `net${code}`, `${desc} (${url})`, code);
    });
    wc.on('did-finish-load', () => {
      if (!current()) return;
      if (this.lastHttp >= 400) this.fail(view, `http${this.lastHttp}`, `resposta HTTP ${this.lastHttp}`);
      else this.ready();
    });
    wc.on('render-process-gone', (_e, details) => {
      if (current()) this.fail(view, 'crash', `renderer encerrado: ${details.reason}`);
    });
    wc.on('unresponsive', () => {
      if (!current()) return;
      log('warn', 'maquete: renderer nao responde');
      this.hangTimer = setTimeout(
        () => this.fail(view, 'hang', 'renderer travado'),
        MAQUETE_HANG_TIMEOUT_MS,
      );
    });
    wc.on('responsive', () => {
      if (this.hangTimer) clearTimeout(this.hangTimer);
      this.hangTimer = undefined;
    });
    wc.on('before-input-event', (e, input) => this.onInput(e, input));
  }

  private ready(): void {
    if (this.loadTimer) clearTimeout(this.loadTimer);
    this.loadTimer = undefined;
    log('info', 'maquete: pronta');
    this.set({ status: 'ready', online: true });
    this.place();
    if (this.visible) {
      this.view?.webContents.setAudioMuted(false);
      this.view?.webContents.focus();
    }
  }

  private fail(view: WebContentsView, kind: string, detail: string, code?: number): void {
    if (this.view !== view || this.disposed) return;
    this.netOnline = net.isOnline();
    const offline = (code !== undefined && OFFLINE_CODES.has(code)) || !this.netOnline;
    log('error', `maquete: falha (${kind}) ${detail}`);
    this.clearTimers();
    this.destroyView();
    this.set({ status: offline ? 'offline' : 'error', online: this.netOnline });
    // Sem rede de verdade: checkNetwork() retoma quando ela voltar. Com rede (DNS/servidor), espaca mais.
    this.scheduleRetry(this.netOnline ? RETRY_ERROR_MS : RETRY_OFFLINE_MS);
  }

  private scheduleRetry(ms: number): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => {
      const s = this.state.status;
      if (s !== 'offline' && s !== 'error') return;
      if (net.isOnline()) this.prepare(false);
      else this.scheduleRetry(ms);
    }, ms);
  }

  /** Detecta a volta da internet e retoma o preparo sem reiniciar o app. */
  private checkNetwork(): void {
    const online = net.isOnline();
    if (online === this.netOnline) return;
    this.netOnline = online;
    this.set({ online });
    if (online && (this.state.status === 'offline' || this.state.status === 'error')) {
      log('info', 'maquete: internet voltou; preparando novamente');
      this.prepare(false);
    }
  }
}
