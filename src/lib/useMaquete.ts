import { useCallback, useEffect, useState } from 'react';
import type { MaqueteState } from '../types/totem';

const INICIAL: MaqueteState = { status: 'idle', online: true, attempt: 0 };

/**
 * Estado da Maquete Virtual vindo do processo principal do Electron (que a
 * prepara em segundo plano). Fora do Electron retorna `null`.
 */
export function useMaquete() {
  const api = window.totem?.maquete;
  const [state, setState] = useState<MaqueteState>(INICIAL);

  useEffect(() => {
    if (!api) return;
    let vivo = true;
    void api.getState().then((s) => vivo && setState(s)).catch(() => undefined);
    const off = api.onState((s) => vivo && setState(s));
    return () => {
      vivo = false;
      off();
    };
  }, [api]);

  const retry = useCallback(async () => {
    if (!api) return;
    setState((s) => ({ ...s, status: 'loading' }));
    try {
      setState(await api.retry());
    } catch {
      setState((s) => ({ ...s, status: 'error' }));
    }
  }, [api]);

  return { enabled: !!api, state, retry };
}
