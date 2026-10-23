import { FACHADAS } from '../data/conteudo';
import { NIVEIS } from '../data/lazer';
import { PAVIMENTOS } from '../data/plantas';
import { full, img, thumb } from './asset';

/**
 * Aquece o cache de imagens em segundo plano, uma por vez e so quando o
 * navegador esta ocioso, para nao competir com a interacao (i5 de 6a geracao).
 * Miniaturas primeiro (telas), depois as versoes ampliadas.
 */
export function preloadImagens(): () => void {
  const urls: string[] = [
    img('localizacao/aerea.webp'),
    ...FACHADAS.map((f) => thumb(f.img)),
    ...NIVEIS.flatMap((n) => [img(n.plano), ...n.ambientes.map((a) => thumb(a.img))]),
    ...PAVIMENTOS.flatMap((p) => [
      img(p.plano),
      ...p.torres.flatMap((t) => t.unidades.map((u) => thumb(u.img))),
    ]),
    ...FACHADAS.map((f) => full(f.img)),
    ...NIVEIS.flatMap((n) => n.ambientes.map((a) => full(a.img))),
    ...PAVIMENTOS.flatMap((p) => p.torres.flatMap((t) => t.unidades.map((u) => full(u.img)))),
  ];

  let cancelado = false;
  let i = 0;
  const idle: (cb: () => void) => void =
    'requestIdleCallback' in window
      ? (cb) => window.requestIdleCallback(cb, { timeout: 1500 })
      : (cb) => window.setTimeout(cb, 120);

  const proxima = () => {
    if (cancelado || i >= urls.length) return;
    const el = new Image();
    el.decoding = 'async';
    el.onload = el.onerror = () => idle(proxima);
    el.src = urls[i++];
  };
  const timer = window.setTimeout(() => idle(proxima), 1500);
  return () => {
    cancelado = true;
    window.clearTimeout(timer);
  };
}
