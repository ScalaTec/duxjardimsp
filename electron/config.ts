// Configuracao do processo principal. Valores podem ser sobrescritos por
// variaveis de ambiente (mesmos nomes usados pelo renderer no Vite).

export const MAQUETE_URL = process.env.VITE_MAQUETE_URL || 'https://dux.allustudio.com/';

/**
 * Tempo maximo para a Maquete carregar E o stream comecar a tocar antes de cair no
 * fallback (o servidor de renderizacao pode precisar subir uma instancia).
 */
export const MAQUETE_LOAD_TIMEOUT_MS = 60_000;

/** O stream e verificado a cada intervalo; so e dado como perdido apos ficar parado por este tempo. */
export const MAQUETE_STREAM_POLL_MS = 2_000;
export const MAQUETE_STREAM_LOST_MS = 6_000;

/** Renderer travado (nao responde) por mais que isso: a view e recriada. */
export const MAQUETE_HANG_TIMEOUT_MS = 20_000;

/** Intervalo de nova tentativa automatica quando offline / com erro. */
export const RETRY_OFFLINE_MS = 10_000;
export const RETRY_ERROR_MS = 60_000;

/** Intervalo de verificacao de conectividade. */
export const NET_POLL_MS = 5_000;

/** Particao persistente: cache HTTP da Maquete sobrevive a reinicios do app. */
export const MAQUETE_PARTITION = 'persist:maquete';

export const BACKGROUND = '#021b2a';
