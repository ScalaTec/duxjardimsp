import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { AREAS_COMUNS, EMPREENDIMENTO, FICHA, TORRES } from '../data/conteudo';
import { thumb } from '../lib/asset';

export default function FichaTecnica() {
  const navigate = useNavigate();

  return (
    <section className="ficha">
      <div className="ficha-info">
        <div className="ficha-titulo">
          <h1>{FICHA.titulo}</h1>
          <p className="tipo">{FICHA.tipo}</p>
          <p className="muted">
            {EMPREENDIMENTO.endereco} · {EMPREENDIMENTO.sub}
          </p>
        </div>

        <div className="card comuns-card">
          <p className="eyebrow">{AREAS_COMUNS.titulo}</p>
          <div className="comuns-grupos">
            {AREAS_COMUNS.grupos.map((g) => (
              <article key={g.titulo}>
                <h2>{g.titulo}</h2>
                {g.nota && <p className="nota">{g.nota}</p>}
                {g.linhas.length > 0 && (
                  <ul>
                    {g.linhas.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>

        <ul className="stats">
          {FICHA.stats.map((s) => (
            <li key={s.rotulo} className="card stat">
              <strong>{s.valor}</strong>
              <span>{s.rotulo}</span>
            </li>
          ))}
        </ul>

        <div className="projeto">
          <p className="eyebrow">PROJETO</p>
          <dl className="card">
            {FICHA.projeto.map((p) => (
              <div key={p.papel}>
                <dt>{p.papel.toUpperCase()}</dt>
                <dd>{p.nome}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="ficha-torres">
        {TORRES.map((t) => (
          <button
            key={t.id}
            type="button"
            className="torre-card"
            onClick={() => navigate(`/ficha-tecnica/${t.id}`)}
            aria-label={`${t.nome}: ver composição`}
          >
            <img src={thumb(t.img)} alt="" decoding="async" />
            <span className="torre-info">
              <strong>{t.nome.toUpperCase()}</strong>
              <span>{t.pavimentos} pavimentos</span>
              <span className="torre-cta">
                VER COMPOSIÇÃO <Icon name="arrow-right" size="1em" />
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
