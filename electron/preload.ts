import { contextBridge, ipcRenderer } from 'electron';

type MaqueteState = { status: string; online: boolean; attempt: number };
type Bounds = { x: number; y: number; width: number; height: number };

/** Assina um canal do processo principal e devolve a funcao de cancelamento. */
function subscribe<T>(channel: string, cb: (payload: T) => void): () => void {
  const handler = (_e: Electron.IpcRendererEvent, payload: T) => cb(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}

// Superficie minima exposta ao renderer (contextIsolation + sandbox).
contextBridge.exposeInMainWorld('totem', {
  isElectron: true,
  appReady: () => ipcRenderer.send('app:ready'),
  onActivity: (cb: () => void) => subscribe<void>('totem:activity', () => cb()),
  window: {
    isFullscreen: (): Promise<boolean> => ipcRenderer.invoke('window:get-fullscreen'),
    setFullscreen: (on: boolean): Promise<boolean> => ipcRenderer.invoke('window:set-fullscreen', on),
    onFullscreen: (cb: (on: boolean) => void) => subscribe<boolean>('window:fullscreen', cb),
  },
  maquete: {
    getState: (): Promise<MaqueteState> => ipcRenderer.invoke('maquete:get-state'),
    onState: (cb: (s: MaqueteState) => void) => subscribe<MaqueteState>('maquete:state', cb),
    show: (bounds: Bounds): Promise<MaqueteState> => ipcRenderer.invoke('maquete:show', bounds),
    setBounds: (bounds: Bounds) => ipcRenderer.send('maquete:bounds', bounds),
    hide: () => ipcRenderer.send('maquete:hide'),
    retry: (): Promise<MaqueteState> => ipcRenderer.invoke('maquete:retry'),
  },
});
