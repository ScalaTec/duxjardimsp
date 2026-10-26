// API exposta pelo preload do Electron (electron/preload.ts).
// Fora do Electron (ex.: navegador em desenvolvimento) `window.totem` e undefined.

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

export interface TotemApi {
  isElectron: true;
  /** Avisa que a Home esta pronta: libera a preparacao da Maquete em segundo plano. */
  appReady(): void;
  /** Atividade de toque/teclado dentro da Maquete (que roda em outra view). */
  onActivity(cb: () => void): () => void;
  window: {
    /** Janela em tela cheia / kiosk. */
    isFullscreen(): Promise<boolean>;
    /** Entra (`true`) ou sai (`false`) da tela cheia; devolve o estado resultante. */
    setFullscreen(on: boolean): Promise<boolean>;
    onFullscreen(cb: (on: boolean) => void): () => void;
  };
  maquete: {
    getState(): Promise<MaqueteState>;
    onState(cb: (state: MaqueteState) => void): () => void;
    show(bounds: Bounds): Promise<MaqueteState>;
    setBounds(bounds: Bounds): void;
    hide(): void;
    retry(): Promise<MaqueteState>;
  };
}

declare global {
  interface Window {
    totem?: TotemApi;
  }
}
