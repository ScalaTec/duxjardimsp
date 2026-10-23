import { useState } from 'react';
import Icon from '../components/Icon';
import Implantacao, { PinoMapa } from '../components/Implantacao';
import Lightbox from '../components/Lightbox';
import { NIVEIS, type Nivel } from '../data/lazer';
import { full, img, thumb } from '../lib/asset';

/** Ambiente exibido ao abrir cada pavimento (Academia no Terreo, como no prototipo). */
const inicial = (n: Nivel) => (n.ambientes.find((a) => a.id === 'academia') ?? n.ambientes[0]).id;

export default function Lazer() {
  const [nivelId, setNivelId] = useState<Nivel['id']>('terreo');
  const [selecao, setSelecao] = useState<Record<string, string>>(() =>
    Object.fromEntries(NIVEIS.map((n) => [n.id, inicial(n)])),
  );
  const [aberto, setAberto] = useState(false);

  const nivel = NIVEIS.find((n) => n.id === nivelId)!;
  const ambiente = nivel.ambientes.find((a) => a.id === selecao[nivel.id]) ?? nivel.ambientes[0];
  const indice = nivel.ambientes.indexOf(ambiente);
  const total = nivel.ambientes.length;
  const escolher = (id: string) => setSelecao((s) => ({ ...s, [nivel.id]: id }));
  const passo = (d: number) => escolher(nivel.ambientes[(indice + d + total) % total].id);

  return (
    <section className="lazer">
      <div className="lazer-top">
        <div>
          <h1>Lazer em três experiências.</h1>
          <p className="sub">Explore o pavimento pela implantação ou pela lista de ambientes.</p>
        </div>
        <div className="tabs" role="tablist" aria-label="Pavimento de lazer">
          {NIVEIS.map((n) => (
            <button
              key={n.id}
              type="button"
              role="tab"
              aria-selected={n.id === nivelId}
              className={`tab${n.id === nivelId ? ' is-active' : ''}`}
              onClick={() => setNivelId(n.id)}
            >
              {n.nome.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="lazer-grid">
        <div className="lazer-left">
          <div className="lazer-plan">
            <Implantacao
              key={nivel.id}
              fit="width"
              src={img(nivel.plano)}
              alt={`Implantação do lazer: ${nivel.nome}`}
            >
              {nivel.ambientes.flatMap((a) =>
                a.pinos.map((p) => (
                  <PinoMapa
                    key={`${a.id}-${p.label}`}
                    label={p.label}
                    x={p.x}
                    y={p.y}
                    nome={a.nome}
                    ativo={a.id === ambiente.id}
                    onSelect={() => escolher(a.id)}
                  />
                )),
              )}
              <p className="plan-tag">
                <strong>IMPLANTAÇÃO · {nivel.nome.toUpperCase()}</strong>
                <span>Toque no número ou no ambiente para explorar.</span>
              </p>
            </Implantacao>
          </div>

          <div className="amb-list">
            <p className="eyebrow">AMBIENTES DO {nivel.nome.toUpperCase()}</p>
            <div className="amb-chips">
              {nivel.ambientes.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`amb-chip${a.id === ambiente.id ? ' is-active' : ''}`}
                  aria-pressed={a.id === ambiente.id}
                  onClick={() => escolher(a.id)}
                >
                  <span className="num">{a.num}</span>
                  <span>{a.nome}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="amb-detail">
          <button
            type="button"
            className="amb-photo"
            onClick={() => setAberto(true)}
            aria-label={`Ampliar ${ambiente.nome}`}
          >
            <img key={ambiente.id} src={thumb(ambiente.img)} alt="" decoding="async" />
            <span className="photo-badge">
              <Icon name="expand" /> AMPLIAR
            </span>
          </button>
          <div className="amb-body">
            <p className="eyebrow">
              {nivel.nome} · {ambiente.num}
            </p>
            <h2 key={ambiente.id}>{ambiente.nome}</h2>
            <p className="desc">{ambiente.desc}</p>
            <div className="actions">
              {total > 1 && (
                <>
                  <button type="button" className="btn btn-ghost btn-round" aria-label="Ambiente anterior" onClick={() => passo(-1)}>
                    <Icon name="chevron-left" />
                  </button>
                  <button type="button" className="btn btn-ghost btn-round" aria-label="Próximo ambiente" onClick={() => passo(1)}>
                    <Icon name="chevron-right" />
                  </button>
                </>
              )}
              <button type="button" className="btn btn-sand" onClick={() => setAberto(true)}>
                <Icon name="expand" /> VER EM TELA CHEIA
              </button>
            </div>
          </div>
        </div>
      </div>

      {aberto && (
        <Lightbox
          items={nivel.ambientes.map((a) => ({
            src: full(a.img),
            alt: `${a.nome}: perspectiva ilustrada`,
            eyebrow: `LAZER · ${nivel.nome.toUpperCase()}`,
            title: a.nome,
            subtitle: a.desc,
            tone: 'dark' as const,
          }))}
          index={indice}
          onIndex={(i) => escolher(nivel.ambientes[i].id)}
          onClose={() => setAberto(false)}
          closeLabel="VOLTAR AO LAZER"
        />
      )}
    </section>
  );
}
