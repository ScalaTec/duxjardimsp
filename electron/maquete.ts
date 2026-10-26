import { BrowserWindow, WebContentsView, net, session } from 'electron';
import {
  BACKGROUND,
  MAQUETE_HANG_TIMEOUT_MS,
  MAQUETE_LOAD_TIMEOUT_MS,
  MAQUETE_PARTITION,
  MAQUETE_STREAM_LOST_MS,
  MAQUETE_STREAM_POLL_MS,
  MAQUETE_URL,
  NET_POLL_MS,
  RETRY_ERROR_MS,
  RETRY_OFFLINE_MS,
} from './config';
import { ExitFullscreenButton } from './exit-fullscreen';
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

/** Cantos arredondados da view no palco; zerados quando ela ocupa a janela inteira. */
const RADIUS = 32;

/**
 * A Maquete e um stream (Streampixel). A pagina carregar nao significa que ha imagem:
 * so esta pronta quando o <video> esta tocando.
 */
const STREAM_PLAYING_JS =
  '(() => { const v = document.querySelector("video"); return !!v && v.readyState >= 3 && v.videoWidth > 0 && !v.paused && !v.ended; })()';

/**
 * O Streampixel avisa "No activity detected" e derruba o stream apos um tempo sem toque.
 * Aqui o aviso nao aparece; o stream derrubado e recuperado por `watchStream`.
 */
const HIDE_AFK_CSS = '#afkOverlay{display:none !important}';

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
  /** A pagina pediu tela cheia (botao de expandir da Maquete): a view passa a cobrir a janela. */
  private htmlFullscreen = false;
  private readonly exitButton: ExitFullscreenButton;
  private lastHttp = 0;
  private started = false;
  private disposed = false;
  private loadTimer?: NodeJS.Timeout;
  private retryTimer?: NodeJS.Timeout;
  private hangTimer?: NodeJS.Timeout;
  private netTimer?: NodeJS.Timeout;
  private streamTimer?: NodeJS.Timeout;
  /** Verificacao do stream em andamento (uma por vez, e so da view atual). */
  private probingView: WebContentsView | null = null;
  /** Desde quando o stream esta parado (0 = tocando). */
  private lostSince = 0;
  /** O stream caiu com a Maquete fora de vista: recarrega so quando alguem abri-la. */
  private stale = false;

  constructor(
    private readonly win: BrowserWindow,
    private readonly onInput: (e: Electron.Event, input: Electron.Input) => void,
  ) {
    // Tudo negado, exceto tela cheia: sem isso o botao de expandir da Maquete nao faz nada.
    session
      .fromPartition(MAQUETE_PARTITION)
      .setPermissionRequestHandler((_wc, permission, cb) => cb(permission === 'fullscreen'));
    this.exitButton = new ExitFullscreenButton(win);
    win.on('resize', this.onResize);
  }

  private readonly onResize = (): void => {
    if (this.htmlFullscreen) this.place();
    this.exitButton.layout();
  };

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
    if (this.stale) this.prepare();
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
    this.leaveHtmlFullscreen();
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

  /** Clique no botao de saida da tela cheia (so vale se vier da view do botao). */
  exitFullscreenFrom(sender: Electron.WebContents): void {
    if (this.exitButton.owns(sender)) this.leaveHtmlFullscreen();
  }

  dispose(): void {
    this.disposed = true;
    this.clearTimers();
    if (this.netTimer) clearInterval(this.netTimer);
    if (!this.win.isDestroyed()) this.win.removeListener('resize', this.onResize);
    this.destroyView();
    this.exitButton.dispose();
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
    this.stopStreamWatch();
  }

  private stopStreamWatch(): void {
    if (this.streamTimer) clearInterval(this.streamTimer);
    this.streamTimer = undefined;
    this.lostSince = 0;
  }

  private destroyView(): void {
    const view = this.view;
    this.view = null;
    this.htmlFullscreen = false;
    this.exitButton.hide();
    if (!view) return;
    try {
      if (!this.win.isDestroyed()) this.win.contentView.removeChildView(view);
      if (!view.webContents.isDestroyed()) view.webContents.close({ waitForBeforeUnload: false });
    } catch (e) {
      log('warn', 'maquete: falha ao destruir a view', String(e));
    }
  }

  /**
   * Mostra a view no palco somente quando pronta; senao a estaciona fora da tela.
   * Em tela cheia (pedida pela propria Maquete) ela cobre a janela inteira.
   */
  private place(): void {
    if (!this.view || this.win.isDestroyed()) return;
    const onScreen = this.visible && this.state.status === 'ready' && this.bounds;
    const full = !!onScreen && this.htmlFullscreen;
    let b: Bounds = onScreen ? this.bounds! : PARKED;
    if (full) {
      const [width, height] = this.win.getContentSize();
      b = { x: 0, y: 0, width, height };
    }
    this.view.setBounds({
      x: Math.round(b.x),
      y: Math.round(b.y),
      width: Math.max(1, Math.round(b.width)),
      height: Math.max(1, Math.round(b.height)),
    });
    this.view.setVisible(true);
    if (full) this.exitButton.show();
    else this.exitButton.hide();
  }

  private setHtmlFullscreen(on: boolean): void {
    if (this.htmlFullscreen === on) return;
    this.htmlFullscreen = on;
    log('info', `maquete: tela cheia ${on ? 'ativada' : 'encerrada'}`);
    try {
      this.view?.setBorderRadius?.(on ? 0 : RADIUS);
    } catch {
      /* API opcional */
    }
    this.place();
    if (on && this.visible) this.view?.webContents.focus();
  }

  /** O estado so muda quando a pagina confirma (`leave-html-full-screen`). */
  private leaveHtmlFullscreen(): void {
    const wc = this.view?.webContents;
    if (!this.htmlFullscreen || !wc || wc.isDestroyed()) return;
    wc.executeJavaScript('document.fullscreenElement && document.exitFullscreen()').catch(() => undefined);
  }

  /**
   * `visible=false` (tentativa automatica em segundo plano) nao troca o fallback
   * pelo loader: quem esta olhando a mensagem nao ve a tela piscar.
   */
  private prepare(visible = true): void {
    if (this.disposed || this.win.isDestroyed()) return;
    this.clearTimers();
    this.destroyView();
    this.stale = false;

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
      view.setBorderRadius?.(RADIUS);
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
    wc.on('enter-html-full-screen', () => current() && this.setHtmlFullscreen(true));
    wc.on('leave-html-full-screen', () => current() && this.setHtmlFullscreen(false));
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
      else this.watchStream(view);
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

  /**
   * Pagina carregada: espera o stream tocar (so entao a Maquete esta "pronta", senao
   * o visitante ficaria diante do loader do Streampixel sem prazo) e, depois, vigia
   * se ele continua tocando. O prazo da espera e o `loadTimer` (fallback DUX).
   */
  private watchStream(view: WebContentsView): void {
    const wc = view.webContents;
    wc.insertCSS(HIDE_AFK_CSS).catch(() => undefined);
    this.stopStreamWatch();
    const probe = () => void this.probeStream(view);
    this.streamTimer = setInterval(probe, MAQUETE_STREAM_POLL_MS);
    probe();
  }

  private async probeStream(view: WebContentsView): Promise<void> {
    const alive = () => this.view === view && !this.disposed && !view.webContents.isDestroyed();
    if (this.probingView === view || !alive()) return;
    this.probingView = view;
    let playing = false;
    try {
      playing = (await view.webContents.executeJavaScript(STREAM_PLAYING_JS)) === true;
    } catch {
      /* pagina em navegacao ou travada: conta como parado */
    } finally {
      if (this.probingView === view) this.probingView = null;
    }
    if (!alive()) return;

    if (playing) {
      this.lostSince = 0;
      if (this.state.status !== 'ready') this.ready();
    } else if (this.state.status === 'ready') {
      this.lostSince ||= Date.now();
      if (Date.now() - this.lostSince >= MAQUETE_STREAM_LOST_MS) this.streamLost();
    }
  }

  /** O stream caiu (inatividade no servidor, queda de rede): recarrega, sem pedir nada ao visitante. */
  private streamLost(): void {
    log('warn', 'maquete: stream encerrado');
    if (this.visible) {
      this.prepare();
      return;
    }
    // Ninguem olhando: nao reabre o stream agora (custa tempo de renderizacao no servidor).
    this.stopStreamWatch();
    this.stale = true;
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
