import { useState } from 'react';
import Icon from '../components/Icon';
import Lightbox from '../components/Lightbox';
import { FACHADAS } from '../data/conteudo';
import { full, thumb } from '../lib/asset';

export default function Fachada() {
  const [aberta, setAberta] = useState<number | null>(null);

  return (
    <section className="fachada">
      <div className="titulo-bloco">
        <h1>
          Quatro perspectivas.
          <br />
          Uma presença única.
        </h1>
        <p className="sub">Toque em uma imagem para ampliar.</p>
      </div>

      <div className="fachada-grid">
        {FACHADAS.map((f, i) => (
          <button
            key={f.id}
            type="button"
            className="foto-card"
            onClick={() => setAberta(i)}
            aria-label={`Ampliar ${f.nome}`}
          >
            <img src={thumb(f.img)} alt="" decoding="async" />
            <span className="foto-label">{f.nome.toUpperCase()}</span>
            <span className="foto-zoom">
              <Icon name="expand" />
            </span>
          </button>
        ))}
      </div>

      {aberta !== null && (
        <Lightbox
          items={FACHADAS.map((f) => ({
            src: full(f.img),
            alt: `${f.nome}: perspectiva ilustrada do empreendimento`,
            eyebrow: 'FACHADA',
            title: f.nome,
            subtitle: 'Imagem ampliada do empreendimento',
            tone: 'dark' as const,
          }))}
          index={aberta}
          onIndex={setAberta}
          onClose={() => setAberta(null)}
          closeLabel="VOLTAR À FACHADA"
        />
      )}
    </section>
  );
}
