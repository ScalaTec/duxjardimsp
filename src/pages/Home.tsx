import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { HOME, PARCEIROS } from '../data/conteudo';
import { full, img } from '../lib/asset';

export default function Home() {
  const navigate = useNavigate();

  return (
    <section className="home">
      <figure className="home-hero">
        <img src={full('fachada/fachada-01')} alt="Perspectiva ilustrada da fachada do DUX Jardim São Paulo" />
        <figcaption>
          FACHADA OFICIAL
          <br />
          DUX · JARDIM SÃO PAULO
        </figcaption>
      </figure>

      <div className="home-body">
        <p className="home-brand">
          <img src={img('brand/dux.webp')} alt="DUX" />
          <span>JARDIM SÃO PAULO</span>
        </p>

        <div className="home-copy">
          <h1>{HOME.titulo}</h1>
          <p className="lead">{HOME.destaque}</p>
          <p className="text">{HOME.texto}</p>
          <button type="button" className="btn btn-sand btn-lg" onClick={() => navigate('/localizacao')}>
            EXPLORAR O DUX <Icon name="arrow-right" />
          </button>
        </div>

        <div className="partners">
          {Object.values(PARCEIROS).map((p) => (
            <button
              key={p.id}
              type="button"
              className="partner"
              onClick={() => navigate(`/parceiro/${p.id}`)}
              aria-label={`Saiba mais sobre ${p.nome}`}
            >
              <span className="partner-more">
                SAIBA MAIS <Icon name="arrow-right" size="1em" />
              </span>
              <img src={img(p.logo)} alt={p.nome} />
              <span className="partner-facts">
                {p.resumo.map((r) => (
                  <span key={r}>{r}</span>
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
