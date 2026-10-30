import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { AREAS_COMUNS } from '../data/conteudo';
import { full } from '../lib/asset';

export default function AreasComuns() {
  const navigate = useNavigate();

  return (
    <section className="torre areas-comuns">
      <figure className="torre-foto">
        <img src={full(AREAS_COMUNS.img)} alt="Hall de entrada do DUX" decoding="async" />
        <figcaption>
          <strong>ÁREAS COMUNS</strong>
          <span>Torres 01 e 02</span>
        </figcaption>
      </figure>

      <div className="torre-comp">
        <p className="eyebrow">ÁREAS COMUNS</p>
        <h1>{AREAS_COMUNS.titulo}</h1>
        <div className="grupos">
          {AREAS_COMUNS.grupos.map((g) => (
            <article key={g.titulo}>
              <h2>{g.titulo}</h2>
              {g.nota && <p className="nota">{g.nota}</p>}
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
        </div>
      </div>
    </section>
  );
}
