import { useLocation, useNavigate } from 'react-router-dom';
import { SECOES } from '../data/conteudo';
import { secaoAtual } from '../lib/secao';

/** Navegacao inferior: sempre visivel, alvos de toque grandes, estado ativo claro. */
export default function Nav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const ativa = secaoAtual(pathname).secao.id;

  return (
    <nav className="nav" aria-label="Navegação principal">
      {SECOES.map((s) => {
        const on = s.id === ativa;
        return (
          <button
            key={s.id}
            type="button"
            className={`nav-item${on ? ' is-active' : ''}`}
            aria-current={on ? 'page' : undefined}
            onClick={() => navigate(s.path)}
          >
            <span className="nav-num">{s.num}</span>
            <span className="nav-label">{s.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
