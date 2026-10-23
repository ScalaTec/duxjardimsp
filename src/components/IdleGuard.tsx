import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TIMEOUT_MS = Number(import.meta.env.VITE_IDLE_TIMEOUT_MS) || 120_000;
const WARNING_MS = 15_000;

/**
 * Volta ao Inicio apos inatividade. Antes, avisa com contagem regressiva para
 * quem ainda estiver olhando a tela. Toques na Maquete (outra view do
 * Electron) chegam por `window.totem.onActivity`.
 */
export default function IdleGuard() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const last = useRef(Date.now());
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    const mark = () => {
      last.current = Date.now();
      setRestante((r) => (r === null ? r : null));
    };
    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    const off = window.totem?.onActivity(mark);
    return () => {
      events.forEach((e) => window.removeEventListener(e, mark));
      off?.();
    };
  }, []);

  // Mudar de tela tambem conta como atividade.
  useEffect(() => {
    last.current = Date.now();
    setRestante(null);
  }, [pathname]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (pathname === '/') {
        setRestante(null);
        return;
      }
      const ocioso = Date.now() - last.current;
      if (ocioso >= TIMEOUT_MS) {
        setRestante(null);
        last.current = Date.now();
        navigate('/');
      } else if (ocioso >= TIMEOUT_MS - WARNING_MS) {
        setRestante(Math.ceil((TIMEOUT_MS - ocioso) / 1000));
      } else {
        setRestante(null);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [navigate, pathname]);

  if (restante === null) return null;
  return (
    <div className="idle" role="alertdialog" aria-label="Ainda está aí?">
      <div className="idle-card">
        <p className="eyebrow">Sessão inativa</p>
        <h2>Ainda está aí?</h2>
        <p>
          Voltando ao início em <strong>{restante}s</strong>.
        </p>
        <button type="button" className="btn btn-sand" onClick={() => setRestante(null)}>
          CONTINUAR NAVEGANDO
        </button>
      </div>
    </div>
  );
}
