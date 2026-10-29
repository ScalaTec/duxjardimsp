import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

export interface LightboxItem {
  src: string;
  alt: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Linhas extras sob o subtitulo (ex.: metragem por final). */
  details?: string[];
  /** `paper`: quadro branco (plantas); `dark`: fotos sobre fundo escuro. */
  tone?: 'paper' | 'dark';
}

interface Props {
  items: LightboxItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  closeLabel: string;
}

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const SWIPE_PX = 70;

interface Transform {
  s: number;
  x: number;
  y: number;
}
type Gesture =
  | { mode: 'pan'; x0: number; y0: number; t0: Transform; moved: boolean }
  | { mode: 'pinch'; dist0: number; mid0: { x: number; y: number }; t0: Transform };

const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(1, s));

/**
 * Visualizador em tela cheia: navegacao anterior/proxima (botoes, deslize e
 * setas do teclado), zoom por pinca, toque duplo, roda do mouse e botoes.
 */
export default function Lightbox({ items, index, onIndex, onClose, closeLabel }: Props) {
  const item = items[index];
  const total = items.length;
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const tf = useRef<Transform>({ s: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  const [zoomed, setZoomed] = useState(false);

  const apply = useCallback((animate = false) => {
    const el = imgRef.current;
    if (!el) return;
    const { s, x, y } = tf.current;
    el.style.transition = animate ? 'transform .28s var(--ease)' : 'none';
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
    setZoomed(s > 1.01);
  }, []);

  /** Limita o deslocamento para a imagem nao sair do quadro. */
  const clampPan = useCallback(() => {
    const frame = frameRef.current;
    const el = imgRef.current;
    const t = tf.current;
    if (!frame || !el) return;
    if (t.s <= 1) {
      t.x = t.y = 0;
      return;
    }
    const fw = frame.clientWidth;
    const fh = frame.clientHeight;
    const nw = el.naturalWidth || fw;
    const nh = el.naturalHeight || fh;
    const r = Math.min(fw / nw, fh / nh);
    const maxX = Math.max(0, (nw * r * t.s - fw) / 2);
    const maxY = Math.max(0, (nh * r * t.s - fh) / 2);
    t.x = Math.min(maxX, Math.max(-maxX, t.x));
    t.y = Math.min(maxY, Math.max(-maxY, t.y));
  }, []);

  const reset = useCallback(
    (animate = true) => {
      tf.current = { s: 1, x: 0, y: 0 };
      apply(animate);
    },
    [apply],
  );

  /** Posicao relativa ao centro do quadro. */
  const rel = (clientX: number, clientY: number) => {
    const r = frameRef.current!.getBoundingClientRect();
    return { x: clientX - r.left - r.width / 2, y: clientY - r.top - r.height / 2 };
  };

  /** Escala mantendo o ponto `p` (relativo ao centro) fixo na tela. */
  const zoomAt = useCallback(
    (nextScale: number, p: { x: number; y: number }, animate: boolean) => {
      const t = tf.current;
      const s = clampScale(nextScale);
      const k = s / t.s;
      tf.current = { s, x: p.x - (p.x - t.x) * k, y: p.y - (p.y - t.y) * k };
      clampPan();
      apply(animate);
    },
    [apply, clampPan],
  );

  const go = useCallback(
    (delta: number) => {
      if (total > 1) onIndex((index + delta + total) % total);
    },
    [index, onIndex, total],
  );

  // Troca de item: volta ao enquadramento inicial.
  useLayoutEffect(() => {
    tf.current = { s: 1, x: 0, y: 0 };
    apply(false);
  }, [index, apply]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  const onPointerDown = (e: React.PointerEvent) => {
    try {
      frameRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* ponteiro ja encerrado: segue sem captura */
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      gesture.current = { mode: 'pan', x0: e.clientX, y0: e.clientY, t0: { ...tf.current }, moved: false };
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        mode: 'pinch',
        dist0: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        mid0: rel((a.x + b.x) / 2, (a.y + b.y) / 2),
        t0: { ...tf.current },
      };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    if (g.mode === 'pinch' && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mid = rel((a.x + b.x) / 2, (a.y + b.y) / 2);
      const s = Math.min(MAX_SCALE * 1.1, Math.max(0.8, g.t0.s * (dist / g.dist0)));
      const k = s / g.t0.s;
      tf.current = { s, x: mid.x - (g.mid0.x - g.t0.x) * k, y: mid.y - (g.mid0.y - g.t0.y) * k };
      apply(false);
    } else if (g.mode === 'pan' && pointers.current.size === 1) {
      const dx = e.clientX - g.x0;
      const dy = e.clientY - g.y0;
      if (!g.moved && Math.hypot(dx, dy) > 8) g.moved = true;
      if (!g.moved) return;
      if (g.t0.s > 1.01) {
        tf.current = { s: g.t0.s, x: g.t0.x + dx, y: g.t0.y + dy };
        clampPan();
      } else {
        tf.current = { s: 1, x: dx * 0.5, y: 0 }; // dica visual do deslize
      }
      apply(false);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    const had = pointers.current.has(e.pointerId);
    pointers.current.delete(e.pointerId);
    if (!had || !g) return;

    if (g.mode === 'pinch') {
      if (pointers.current.size < 2) {
        // Termina a pinca: reenquadra e continua como arrasto com o dedo restante.
        if (tf.current.s < 1.05) tf.current = { s: 1, x: 0, y: 0 };
        tf.current.s = clampScale(tf.current.s);
        clampPan();
        apply(true);
        const rest = [...pointers.current.values()][0];
        gesture.current = rest
          ? { mode: 'pan', x0: rest.x, y0: rest.y, t0: { ...tf.current }, moved: true }
          : null;
      }
      return;
    }

    gesture.current = null;
    if (g.moved) {
      const dx = e.clientX - g.x0;
      const dy = e.clientY - g.y0;
      if (g.t0.s <= 1.01 && Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.4) {
        reset(false);
        go(dx < 0 ? 1 : -1);
      } else {
        clampPan();
        apply(true);
      }
      return;
    }

    // Toque sem arrastar: toque duplo alterna o zoom.
    const now = performance.now();
    const lt = lastTap.current;
    if (now - lt.t < 320 && Math.hypot(e.clientX - lt.x, e.clientY - lt.y) < 40) {
      if (tf.current.s > 1.05) reset(true);
      else zoomAt(DOUBLE_TAP_SCALE, rel(e.clientX, e.clientY), true);
      lastTap.current = { t: 0, x: 0, y: 0 };
    } else {
      lastTap.current = { t: now, x: e.clientX, y: e.clientY };
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    zoomAt(tf.current.s * Math.exp(-e.deltaY * 0.0015), rel(e.clientX, e.clientY), false);
  };

  const stop = (e: React.PointerEvent) => e.stopPropagation();
  const center = { x: 0, y: 0 };

  // Portal: fora do contexto de empilhamento da pagina (cabecalho e navegacao).
  return createPortal(
    <div className="lb" role="dialog" aria-modal="true" aria-label={item.title}>
      <header className="lb-head">
        <div>
          {item.eyebrow && <p className="eyebrow">{item.eyebrow}</p>}
          <h2 className="lb-title">{item.title}</h2>
          {item.subtitle && <p className="lb-sub">{item.subtitle}</p>}
          {item.details && item.details.length > 0 && (
            <ul className="lb-details">
              {item.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
        </div>
        <p className="brand-mini" aria-hidden="true">
          <strong>DUX</strong>
          <span>JARDIM SÃO PAULO</span>
        </p>
      </header>

      <div className="lb-stage">
        <div
          ref={frameRef}
          className={`lb-frame tone-${item.tone ?? 'dark'}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          <img
            key={item.src}
            ref={imgRef}
            className="lb-img"
            src={item.src}
            alt={item.alt}
            draggable={false}
            onLoad={() => {
              clampPan();
              apply(false);
            }}
          />
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              className="lb-arrow is-prev"
              aria-label="Anterior"
              onPointerDown={stop}
              onClick={() => go(-1)}
            >
              <Icon name="chevron-left" size="1.6rem" />
            </button>
            <button
              type="button"
              className="lb-arrow is-next"
              aria-label="Próxima"
              onPointerDown={stop}
              onClick={() => go(1)}
            >
              <Icon name="chevron-right" size="1.6rem" />
            </button>
          </>
        )}

        <div className="lb-zoom" onPointerDown={stop}>
          <button type="button" aria-label="Reduzir" onClick={() => zoomAt(tf.current.s / 1.6, center, true)}>
            <Icon name="minus" />
          </button>
          <button
            type="button"
            className="lb-zoom-reset"
            aria-label="Restaurar"
            disabled={!zoomed}
            onClick={() => reset(true)}
          >
            <Icon name="expand" />
          </button>
          <button type="button" aria-label="Ampliar" onClick={() => zoomAt(tf.current.s * 1.6, center, true)}>
            <Icon name="plus" />
          </button>
        </div>
      </div>

      <footer className="lb-foot">
        <button type="button" className="btn btn-sand" onClick={onClose}>
          <Icon name="arrow-left" /> {closeLabel}
        </button>
        {total > 1 && (
          <div className="lb-count" aria-live="polite">
            {total <= 8 ? (
              <span className="dots" aria-hidden="true">
                {items.map((it, i) => (
                  <button
                    key={it.src}
                    type="button"
                    tabIndex={-1}
                    className={i === index ? 'is-on' : ''}
                    onClick={() => onIndex(i)}
                  />
                ))}
              </span>
            ) : null}
            <span>
              {index + 1} / {total}
            </span>
          </div>
        )}
        <p className="lb-hint">
          <Icon name="touch" /> Toque duas vezes ou use a pinça para ampliar
        </p>
      </footer>
    </div>,
    document.body,
  );
}
