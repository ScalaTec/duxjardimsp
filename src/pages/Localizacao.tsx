import { useState } from 'react';
import Icon from '../components/Icon';
import Implantacao from '../components/Implantacao';
import Lightbox from '../components/Lightbox';
import { EMPREENDIMENTO, LOCALIZACAO } from '../data/conteudo';
import { img } from '../lib/asset';

const RATIO = 3607 / 1698;

export default function Localizacao() {
  const [aberta, setAberta] = useState(false);
  const [poiId, setPoiId] = useState<string | null>('estacao');
  const src = img(LOCALIZACAO.foto);
  const poi = LOCALIZACAO.pois.find((p) => p.id === poiId);

  return (
    <section className="loc">
      <div className="loc-text">
        <h1>{LOCALIZACAO.titulo}</h1>
        <p className="sub">{LOCALIZACAO.texto}</p>

        <div className="card address">
          <p className="eyebrow">ENDEREÇO</p>
          <p className="addr">{EMPREENDIMENTO.endereco}</p>
          <p className="muted">{EMPREENDIMENTO.bairro}</p>
          <p className="ref">{EMPREENDIMENTO.referencia}</p>
        </div>

        <ul className="facts">
          {LOCALIZACAO.destaques.map((d) => (
            <li key={d.valor}>
              <strong>{d.valor}</strong>
              <span>{d.rotulo}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="loc-right">
        <div className="loc-photo-wrap">
          <div className="loc-photo">
            <Implantacao src={src} alt="Foto aérea oficial com os pontos de referência do entorno" ratio={RATIO}>
              {poi && (
                <span
                  key={poi.id}
                  className="poi-mark"
                  data-align={poi.x < 20 ? 'start' : poi.x > 80 ? 'end' : 'center'}
                  style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
                  aria-hidden="true"
                >
                  <i />
                  <span className="poi-tag">{poi.nome}</span>
                </span>
              )}
            </Implantacao>
            <button type="button" className="photo-open" onClick={() => setAberta(true)} aria-label="Ampliar foto aérea">
              <span className="photo-caption">
                <strong>FOTO AÉREA OFICIAL</strong>
                <span>Toque para ampliar e explorar</span>
              </span>
              <span className="photo-badge">
                <Icon name="expand" /> AMPLIAR
              </span>
            </button>
          </div>
        </div>

        <div className="poi-list">
          <p className="eyebrow">PONTOS DE REFERÊNCIA · toque para localizar na foto</p>
          <div className="poi-chips">
            {LOCALIZACAO.pois.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`poi-chip${p.id === poiId ? ' is-active' : ''}`}
                aria-pressed={p.id === poiId}
                onClick={() => setPoiId(p.id === poiId ? null : p.id)}
              >
                {p.curto}
              </button>
            ))}
          </div>
        </div>
      </div>

      {aberta && (
        <Lightbox
          items={[
            {
              src,
              alt: 'Foto aérea oficial com os pontos de referência do entorno',
              eyebrow: 'LOCALIZAÇÃO',
              title: 'Foto aérea oficial',
              subtitle: 'Arraste e amplie para explorar os pontos de referência da região.',
              tone: 'dark',
            },
          ]}
          index={0}
          onIndex={() => undefined}
          onClose={() => setAberta(false)}
          closeLabel="VOLTAR À LOCALIZAÇÃO"
        />
      )}
    </section>
  );
}
