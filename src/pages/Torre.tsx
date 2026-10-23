import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { TORRES } from '../data/conteudo';
import { full } from '../lib/asset';

export default function Torre() {
  const { torre } = useParams();
  const navigate = useNavigate();
  const t = TORRES.find((x) => x.id === torre);
  if (!t) return <Navigate to="/ficha-tecnica" replace />;
  const outra = TORRES.find((x) => x.id !== t.id)!;

  return (
    <section className="torre">
      <figure className="torre-foto">
        <img src={full(t.img)} alt={`Perspectiva da ${t.nome}`} decoding="async" />
        <figcaption>
          <strong>{t.nome.toUpperCase()}</strong>
          <span>{t.pavimentos} pavimentos</span>
        </figcaption>
      </figure>

      <div className="torre-comp">
        <p className="eyebrow">COMPOSIÇÃO</p>
        <h1>Tipologias e distribuição</h1>
        <div className="grupos">
          {t.grupos.map((g) => (
            <article key={g.titulo}>
              <h2>{g.titulo}</h2>
              {g.linhas.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </article>
          ))}
        </div>
        <div className="actions">
          <button type="button" className="btn btn-ink" onClick={() => navigate('/ficha-tecnica')}>
            <Icon name="arrow-left" /> VOLTAR À FICHA
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(`/ficha-tecnica/${outra.id}`, { replace: true })}
          >
            VER {outra.nome.toUpperCase()} <Icon name="arrow-right" />
          </button>
        </div>
      </div>
    </section>
  );
}
