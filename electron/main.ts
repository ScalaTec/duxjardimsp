import { BrowserWindow, Menu, app, ipcMain } from 'electron';
import type { IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import path from 'node:path';
import { BACKGROUND } from './config';
import { log } from './logger';
import { MaqueteService, type Bounds } from './maquete';

const isDev = !app.isPackaged;
// `electron . --dev-server` carrega o Vite; sem a flag carrega o bundle em dist/.
const useDevServer = isDev && process.argv.includes('--dev-server');
const DEV_URL = process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:5173';

let win: BrowserWindow | null = null;
let maquete: MaqueteService | null = null;

// Um totem nunca deve ter duas instancias.
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

// Tela de toque: sem zoom por pinca da pagina nem navegacao por gestos.
app.commandLine.appendSwitch('disable-pinch');
app.commandLine.appendSwitch('overscroll-history-navigation', '0');

process.on('uncaughtException', (err) => log('error', 'uncaughtException', String(err?.stack ?? err)));
process.on('unhandledRejection', (err) => {
  // Ruido esperado quando a pagina recarrega no meio de uma chamada IPC.
  const msg = String(err);
  log(msg.includes('Render frame was disposed') ? 'warn' : 'error', 'unhandledRejection', msg);
});

/** Aceita IPC apenas da janela principal. */
const fromApp = (e: IpcMainEvent | IpcMainInvokeEvent) => !!win && e.sender === win.webContents;

function createWindow(): void {
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: !isDev,
    kiosk: !isDev,
    autoHideMenuBar: true,
    frame: isDev,
    show: false,
    backgroundColor: BACKGROUND,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      devTools: isDev,
      spellcheck: false,
    },
  });
  const w = win;

  w.once('ready-to-show', () => w.show());
  w.on('closed', () => {
    maquete?.dispose();
    maquete = null;
    win = null;
  });

  const wc = w.webContents;
  wc.setVisualZoomLevelLimits(1, 1);
  wc.setWindowOpenHandler(() => ({ action: 'deny' }));
  wc.on('will-navigate', (e) => e.preventDefault());
  wc.on('did-finish-load', () => {
    // Totem de toque: sem cursor do mouse (somente no executavel instalado).
    if (!isDev) void wc.insertCSS('*{cursor:none !important}');
  });

  // Recuperacao: se o renderer da interface cair, recarrega em vez de ficar travado.
  wc.on('render-process-gone', (_e, details) => {
    log('error', 'renderer principal encerrado', details.reason);
    setTimeout(() => {
      if (!w.isDestroyed()) wc.reload();
    }, 1000);
  });
  wc.on('did-fail-load', (_e, code, desc, url, isMainFrame) => {
    if (!isMainFrame || code === -3) return;
    log('error', `falha ao carregar a interface (${code} ${desc}) ${url}`);
    setTimeout(() => {
      if (!w.isDestroyed()) wc.reload();
    }, 2000);
  });

  // Entrada de teclado/toque (da interface e da Maquete): sinaliza atividade e filtra atalhos.
  let lastActivity = 0;
  const onInput = (e: Electron.Event, input: Electron.Input) => {
    const now = Date.now();
    if (now - lastActivity > 500 && !wc.isDestroyed()) {
      lastActivity = now;
      wc.send('totem:activity');
    }
    if (input.type !== 'keyDown') return;
    const k = input.key.toLowerCase();
    // Saida administrativa: Ctrl+Shift+Alt+Q.
    if (input.control && input.shift && input.alt && k === 'q') {
      log('info', 'saida administrativa solicitada');
      app.quit();
      return;
    }
    // Atalhos que poderiam tirar o totem da apresentacao.
    if (!isDev && (['f11', 'f5', 'f12'].includes(k) || (input.control && ['r', 'w', 'n', 'p', '+', '-', '='].includes(k)))) {
      e.preventDefault();
    }
  };
  wc.on('before-input-event', onInput);

  maquete = new MaqueteService(w, onInput);

  const loading = useDevServer ? w.loadURL(DEV_URL) : w.loadFile(path.join(__dirname, '../dist/index.html'));
  loading.catch((err) => log('warn', 'carregamento da interface interrompido', String(err)));
}

ipcMain.on('app:ready', (e) => fromApp(e) && maquete?.start());
ipcMain.handle('maquete:get-state', (e) => (fromApp(e) && maquete ? maquete.getState() : null));
ipcMain.handle('maquete:show', (e, bounds: Bounds) => (fromApp(e) && maquete ? maquete.show(bounds) : null));
ipcMain.on('maquete:bounds', (e, bounds: Bounds) => fromApp(e) && maquete?.setBounds(bounds));
ipcMain.on('maquete:hide', (e) => fromApp(e) && maquete?.hide());
ipcMain.handle('maquete:retry', (e) => (fromApp(e) && maquete ? maquete.retry() : null));

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  // Inicia junto com o Windows (somente no executavel instalado).
  if (app.isPackaged) app.setLoginItemSettings({ openAtLogin: true });
  createWindow();
  log('info', `totem iniciado (${isDev ? 'dev' : 'producao'}) v${app.getVersion()}`);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
