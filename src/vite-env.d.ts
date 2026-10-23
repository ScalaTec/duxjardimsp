/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL da Maquete Virtual (padrao: https://dux.allustudio.com/). */
  readonly VITE_MAQUETE_URL?: string;
  /** Inatividade (ms) ate voltar ao Inicio. Padrao: 120000. */
  readonly VITE_IDLE_TIMEOUT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
