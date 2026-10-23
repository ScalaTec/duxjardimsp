/** URL de um arquivo em public/img (relativa, funciona em file:// no Electron). */
export const img = (path: string) => `${import.meta.env.BASE_URL}img/${path}`;

/** Versao em miniatura gerada por scripts/optimize-images.mjs (`x.webp` -> `x-t.webp`). */
export const thumb = (base: string) => img(`${base}-t.webp`);
export const full = (base: string) => img(`${base}.webp`);
