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

        <button
          type="button"
          className="card comuns-card"
          onClick={() => navigate('/ficha-tecnica/areas-comuns')}
        >
          <span className="eyebrow">ÁREAS COMUNS · LOJAS, VAGAS E LAZER</span>
          <span className="comuns-itens">
            {AREAS_COMUNS.destaques.map((d) => (
              <span key={d.rotulo}>
                <strong>{d.valor}</strong>
                <small>{d.rotulo}</small>
              </span>
            ))}
          </span>
          <span className="comuns-cta">
            VER ÁREAS COMUNS <Icon name="arrow-right" size="1em" />
          </span>
        </button>

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
