import { useMemo, useState } from 'react';
import Icon from '../components/Icon';
import Implantacao, { PinoMapa } from '../components/Implantacao';
import Lightbox from '../components/Lightbox';
import {
  PAVIMENTOS,
  detalheMetragens,
  formatarArea,
  resumoArea,
  textoMetragem,
  unidadeDoPino,
  type TorrePav,
  type Unidade,
} from '../data/plantas';
import { full, img, thumb } from '../lib/asset';

type Item = Unidade & { torre: TorrePav };

const pavimentosDa = (torre: TorrePav, titulo: string) => `${torre.nome} · ${torre.pavimentos ?? titulo} pavimento`;

export default function Plantas() {
  const [pavId, setPavId] = useState(PAVIMENTOS[0].id);
  const pav = PAVIMENTOS.find((p) => p.id === pavId)!;
  const itens = useMemo<Item[]>(
    () => pav.torres.flatMap((t) => t.unidades.map((u) => ({ ...u, torre: t }))),
    [pav],
  );
  const [selId, setSelId] = useState<string>(itens[0].id);
  const [aberta, setAberta] = useState(false);

  const atual = itens.find((i) => i.id === selId) ?? itens[0];
  const indice = itens.indexOf(atual);
  const detalhe = detalheMetragens(atual);
  const passo = (d: number) => setSelId(itens[(indice + d + itens.length) % itens.length].id);

  const trocarPavimento = (id: typeof pavId) => {
    const p = PAVIMENTOS.find((x) => x.id === id)!;
    setPavId(id);
    setSelId(p.torres[0].unidades[0].id);
  };

  return (
    <section className="plantas">
      <h1>Escolha primeiro o pavimento. Depois, a unidade.</h1>

      <div className="pav-select" role="tablist" aria-label="Pavimento">
        {PAVIMENTOS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.id === pavId}
            className={`pav-card${p.id === pavId ? ' is-active' : ''}`}
            onClick={() => trocarPavimento(p.id)}
          >
            <strong>{p.titulo}</strong>
            <span>{p.resumo}</span>
          </button>
        ))}
      </div>

      <div className="plantas-grid">
        <div className="plantas-left">
          <div className="pav-plan">
            <Implantacao
              key={pav.id}
              fit="width"
              denso
              src={img(pav.plano)}
              alt={`Implantação do ${pav.titulo} pavimento`}
            >
              {pav.torres.flatMap((t) =>
                t.pinos.flatMap((p) => {
                  const u = unidadeDoPino(t, p.n);
                  if (!u) return [];
                  return [
                    <PinoMapa
                      key={`${t.id}-${p.n}`}
                      label={String(p.n).padStart(2, '0')}
                      x={p.x}
                      y={p.y}
                      nome={`${t.nome} · ${u.label}`}
                      ativo={u.id === atual.id}
                      onSelect={() => setSelId(u.id)}
                    />,
                  ];
                }),
              )}
              <p className="plan-tag">
                <strong>IMPLANTAÇÃO DO PAVIMENTO</strong>
                <span>Toque no número do final para ver a planta.</span>
              </p>
            </Implantacao>
          </div>

          <div className="unit-chips">
            {pav.torres.map((t) => (
              <div key={t.id} className="unit-torre">
                <p className="eyebrow">{t.nome.toUpperCase()}</p>
                <div className="chips-grid">
                  {t.unidades.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className={`unit-chip${u.id === atual.id ? ' is-active' : ''}`}
                      aria-pressed={u.id === atual.id}
                      onClick={() => setSelId(u.id)}
                    >
                      <strong>{u.label}</strong>
                      <span>{resumoArea(u)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="unit-detail">
          <div className="unit-head">
            <p className="eyebrow">UNIDADE SELECIONADA</p>
            <h2 key={atual.id}>
              {atual.label} · {resumoArea(atual)}
            </h2>
            <p className="muted">{pavimentosDa(atual.torre, pav.titulo)}</p>
            {detalhe.length > 0 && (
              <div className="unit-areas">
                <p className="eyebrow">METRAGEM POR PAVIMENTO</p>
                <ul>
                  {detalhe.map((l) => (
                    <li key={l.rotulo ?? 'unico'}>
                      {l.rotulo && <strong>{l.rotulo}</strong>}
                      <div>
                        {l.itens.map((i) => (
                          <span key={i.area + (i.pav ?? '')}>
                            <b>{formatarArea(i.area)}</b>
                            {i.pav && <em>{i.pav}</em>}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            type="button"
            className="unit-preview"
            onClick={() => setAberta(true)}
            aria-label={`Ampliar planta ${atual.label}`}
          >
            <img key={atual.id} src={thumb(atual.img)} alt="" decoding="async" />
          </button>

          <div className="actions">
            {itens.length > 1 && (
              <>
                <button type="button" className="btn btn-outline btn-round" aria-label="Planta anterior" onClick={() => passo(-1)}>
                  <Icon name="chevron-left" />
                </button>
                <button type="button" className="btn btn-outline btn-round" aria-label="Próxima planta" onClick={() => passo(1)}>
                  <Icon name="chevron-right" />
                </button>
              </>
            )}
            <button type="button" className="btn btn-ink" onClick={() => setAberta(true)}>
              <Icon name="expand" /> AMPLIAR PLANTA
            </button>
          </div>
        </div>
      </div>

      {aberta && (
        <Lightbox
          items={itens.map((i) => ({
            src: full(i.img),
            alt: `Planta ${i.label}, ${resumoArea(i)}`,
            eyebrow: 'PLANTA AMPLIADA',
            title: `${i.label} · ${resumoArea(i)}`,
            subtitle: pavimentosDa(i.torre, pav.titulo),
            details: detalheMetragens(i).map(textoMetragem),
            tone: 'paper' as const,
          }))}
          index={indice}
          onIndex={(i) => setSelId(itens[i].id)}
          onClose={() => setAberta(false)}
          closeLabel="VOLTAR ÀS PLANTAS"
        />
      )}
    </section>
  );
}
