import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { MAQUETE } from '../data/conteudo';
import { img } from '../lib/asset';
import { useMaquete } from '../lib/useMaquete';

const WEB_TIMEOUT_MS = 25_000;

function Carregando() {
  return (
    <div className="m-card m-loading" role="status" aria-live="polite">
      <img src={img('brand/dux.webp')} alt="DUX" />
      <p className="m-title">PREPARANDO A MAQUETE VIRTUAL</p>
      <div className="m-bar" aria-hidden="true">
        <i />
      </div>
      <p className="m-text">Em instantes você poderá navegar pelo empreendimento.</p>
    </div>
  );
}

function Indisponivel({
  offline,
  onRetry,
  onBack,
}: {
  offline: boolean;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <div className="m-card m-fail" role="alert">
      <span className="m-icon">
        <Icon name="wifi-off" size="2.25rem" />
      </span>
      <p className="m-title">{MAQUETE.indisponivel.titulo.toUpperCase()}</p>
      <p className="m-text">{MAQUETE.indisponivel.texto}</p>
      {offline && <p className="m-note">Tentaremos novamente de forma automática quando a internet voltar.</p>}
      <div className="actions">
        <button type="button" className="btn btn-sand" onClick={onRetry}>
          <Icon name="refresh" /> TENTAR NOVAMENTE
        </button>
        <button type="button" className="btn btn-light" onClick={onBack}>
          <Icon name="arrow-left" /> VOLTAR À APRESENTAÇÃO
        </button>
      </div>
    </div>
  );
}

/** Fora do Electron (navegador em desenvolvimento): iframe simples com timeout. */
function MaqueteWeb({ onBack }: { onBack: () => void }) {
  const [fase, setFase] = useState<'loading' | 'ready' | 'error'>(navigator.onLine ? 'loading' : 'error');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (fase !== 'loading') return;
    const t = window.setTimeout(() => setFase((f) => (f === 'loading' ? 'error' : f)), WEB_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [fase, tentativa]);

  return (
    <>
      {fase !== 'error' && (
        <iframe
          key={tentativa}
          className="m-frame"
          src={MAQUETE.url}
          title="Maquete virtual do DUX Jardim São Paulo"
          allow="fullscreen"
          onLoad={() => setFase('ready')}
          style={{ visibility: fase === 'ready' ? 'visible' : 'hidden' }}
        />
      )}
      {fase === 'loading' && <Carregando />}
      {fase === 'error' && (
        <Indisponivel
          offline={!navigator.onLine}
          onBack={onBack}
          onRetry={() => {
            setTentativa((n) => n + 1);
            setFase(navigator.onLine ? 'loading' : 'error');
          }}
        />
      )}
    </>
  );
}

export default function Maquete() {
  const navigate = useNavigate();
  const { enabled, state, retry } = useMaquete();
  const stageRef = useRef<HTMLDivElement>(null);
  const voltar = () => navigate('/');

  // Posiciona a view nativa da Maquete (processo principal) sobre o palco.
  useEffect(() => {
    const api = window.totem?.maquete;
    const el = stageRef.current;
    if (!api || !el || state.status !== 'ready') return;
    const bounds = () => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left), y: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) };
    };
    void api.show(bounds());
    const sync = () => api.setBounds(bounds());
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
      api.hide();
    };
  }, [state.status]);

  const pronta = enabled && state.status === 'ready';
  const falhou = enabled && (state.status === 'offline' || state.status === 'error');
  const rotulo = !enabled
    ? null
    : pronta
      ? { cls: 'ok', texto: 'Maquete pronta' }
      : falhou
        ? { cls: 'off', texto: state.status === 'offline' ? 'Sem conexão' : 'Indisponível' }
        : { cls: 'wait', texto: 'Preparando…' };

  return (
    <section className="maquete">
      <div className="maquete-title">
        <h1>{MAQUETE.titulo}</h1>
        <p className="sub">{MAQUETE.texto}</p>
      </div>

      <div className="maquete-stage" ref={stageRef}>
        {!enabled && <MaqueteWeb onBack={voltar} />}
        {enabled && !pronta && !falhou && <Carregando />}
        {falhou && <Indisponivel offline={state.status === 'offline'} onRetry={() => void retry()} onBack={voltar} />}
      </div>

      <div className="maquete-actions">
        <button type="button" className="btn btn-light" onClick={voltar}>
          <Icon name="home" /> VOLTAR AO INÍCIO
        </button>
        {pronta && (
          <button type="button" className="btn btn-ghost" onClick={() => void retry()}>
            <Icon name="refresh" /> REINICIAR MAQUETE
          </button>
        )}
        {rotulo && (
          <span className={`status-pill ${rotulo.cls}`}>
            <i /> {rotulo.texto}
          </span>
        )}
      </div>
    </section>
  );
}
