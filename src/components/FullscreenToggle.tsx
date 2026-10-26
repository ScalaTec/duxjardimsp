import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

/**
 * Botao discreto no canto superior direito: sai da tela cheia (kiosk) do totem
 * e, estando fora dela, volta. Somente no Electron. Portal no body para ficar
 * acima do visualizador e do aviso de inatividade.
 */
export default function FullscreenToggle() {
  const api = window.totem?.window;
  const [cheia, setCheia] = useState(true);

  useEffect(() => {
    if (!api) return;
    let vivo = true;
    void api.isFullscreen().then((on) => vivo && setCheia(on)).catch(() => undefined);
    const off = api.onFullscreen((on) => vivo && setCheia(on));
    return () => {
      vivo = false;
      off();
    };
  }, [api]);

  if (!api) return null;
  const rotulo = cheia ? 'Sair da tela cheia' : 'Entrar em tela cheia';
  return createPortal(
    <button
      type="button"
      className="fs-toggle"
      aria-label={rotulo}
      title={rotulo}
      onClick={() => void api.setFullscreen(!cheia).then(setCheia).catch(() => undefined)}
    >
      <Icon name={cheia ? 'compress' : 'expand'} size="1.1rem" />
    </button>,
    document.body,
  );
}
