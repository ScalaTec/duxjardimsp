import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TIMEOUT_MS = Number(import.meta.env.VITE_IDLE_TIMEOUT_MS) || 120_000;
/** Prazo com o foco dentro de um iframe (Maquete na versao web). */
const TIMEOUT_IFRAME_MS = 10 * 60_000;

/**
 * Volta ao Inicio apos inatividade, sem aviso na tela. Toques na Maquete (outra
 * view do Electron) chegam por `window.totem.onActivity`. Na versao web a Maquete
 * e um iframe de outra origem: os toques dentro dele nunca chegam a esta janela,
 * entao, com o foco nele, o prazo passa a `TIMEOUT_IFRAME_MS`, contado a partir
 * do ultimo toque fora dele.
 */
export default function IdleGuard() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const last = useRef(Date.now());

  useEffect(() => {
    const mark = () => {
      last.current = Date.now();
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
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/') return;
    const id = window.setInterval(() => {
      const limite = document.activeElement instanceof HTMLIFrameElement ? TIMEOUT_IFRAME_MS : TIMEOUT_MS;
      if (Date.now() - last.current >= limite) {
        last.current = Date.now();
        navigate('/');
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [navigate, pathname]);

  return null;
}
