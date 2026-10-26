import { WebContentsView } from 'electron';
import type { BrowserWindow, WebContents } from 'electron';
import path from 'node:path';

const SIZE = 44;
const MARGIN = 10;

const ICON =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';

const PAGE = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#021b2a;-webkit-user-select:none;user-select:none}
button{all:unset;box-sizing:border-box;position:fixed;inset:0;display:grid;place-items:center;
color:#fff;opacity:.4;cursor:pointer;-webkit-tap-highlight-color:transparent}
button:active{opacity:1;background:#0f3a55}
</style><button type="button" aria-label="Sair da tela cheia">${ICON}</button>
<script>document.querySelector('button').addEventListener('click',()=>window.exitFullscreen())</script></html>`;

/**
 * Botao discreto sobre a Maquete em tela cheia. A Maquete e uma view nativa que
 * cobre a janela inteira (e a interface DUX), e na tela de toque nao ha tecla
 * Esc: sem este botao nao haveria como sair. E uma view propria, empilhada
 * acima da Maquete, para nao depender do conteudo remoto.
 */
export class ExitFullscreenButton {
  private view: WebContentsView | null = null;
  private attached = false;

  constructor(private readonly win: BrowserWindow) {}

  /** O clique so vale se vier desta view. */
  owns(sender: WebContents): boolean {
    return !!this.view && !this.view.webContents.isDestroyed() && this.view.webContents === sender;
  }

  show(): void {
    if (this.win.isDestroyed()) return;
    const view = this.ensure();
    // Adicionar de novo move a view para o topo da pilha.
    if (!this.attached) this.win.contentView.addChildView(view);
    this.attached = true;
    this.layout();
  }

  hide(): void {
    if (!this.view || !this.attached) return;
    this.attached = false;
    if (!this.win.isDestroyed()) this.win.contentView.removeChildView(this.view);
  }

  /** Canto superior direito da janela. */
  layout(): void {
    if (!this.view || !this.attached || this.win.isDestroyed()) return;
    const [width] = this.win.getContentSize();
    this.view.setBounds({ x: Math.max(0, width - SIZE - MARGIN), y: MARGIN, width: SIZE, height: SIZE });
  }

  dispose(): void {
    const view = this.view;
    this.view = null;
    this.attached = false;
    if (!view) return;
    try {
      if (!this.win.isDestroyed()) this.win.contentView.removeChildView(view);
      if (!view.webContents.isDestroyed()) view.webContents.close({ waitForBeforeUnload: false });
    } catch {
      /* janela ja encerrada */
    }
  }

  /** Criada so na primeira tela cheia: nao custa um processo extra enquanto ninguem usa. */
  private ensure(): WebContentsView {
    if (this.view) return this.view;
    const view = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, 'exit-fullscreen-preload.js'),
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        devTools: false,
        spellcheck: false,
        backgroundThrottling: false,
      },
    });
    try {
      view.setBackgroundColor('#021b2a');
      view.setBorderRadius?.(SIZE / 2);
    } catch {
      /* APIs opcionais */
    }
    const wc = view.webContents;
    wc.setWindowOpenHandler(() => ({ action: 'deny' }));
    wc.on('will-navigate', (e) => e.preventDefault());
    void wc.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(PAGE)}`).catch(() => undefined);
    this.view = view;
    return view;
  }
}
