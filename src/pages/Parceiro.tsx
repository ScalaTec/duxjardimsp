import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { PARCEIROS, type Parceiro as ParceiroT } from '../data/conteudo';
import { img } from '../lib/asset';

export default function Parceiro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const p = PARCEIROS[id as ParceiroT['id']];
  if (!p) return <Navigate to="/" replace />;
  const outro = Object.values(PARCEIROS).find((x) => x.id !== p.id)!;

  return (
    <section className="parceiro">
      <div className="parceiro-text">
        <p className="eyebrow">{p.papel.toUpperCase()}</p>
        <h1 style={p.cor ? { color: p.cor } : undefined}>{p.nome}</h1>
        <p className="manchete">{p.manchete}</p>
        {p.textos.map((t) => (
          <p key={t} className="corpo">
            {t}
          </p>
        ))}
        <ul className="facts">
          {p.destaques.map((d) => (
            <li key={d.valor + d.rotulo}>
              <strong>{d.valor}</strong>
              <span>{d.rotulo}</span>
            </li>
          ))}
        </ul>
        <div className="actions">
          <button type="button" className="btn btn-sand" onClick={() => navigate('/')}>
            <Icon name="arrow-left" /> VOLTAR AO INÍCIO
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(`/parceiro/${outro.id}`, { replace: true })}>
            CONHECER {outro.nome.toUpperCase()} <Icon name="arrow-right" />
          </button>
        </div>
      </div>
      <div className="parceiro-logo" aria-hidden="true">
        <img src={img(p.logo)} alt="" />
      </div>
    </section>
  );
}
