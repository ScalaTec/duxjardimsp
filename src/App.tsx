import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import IdleGuard from './components/IdleGuard';
import Nav from './components/Nav';
import { preloadImagens } from './lib/preload';
import { secaoAtual } from './lib/secao';
import Fachada from './pages/Fachada';
import FichaTecnica from './pages/FichaTecnica';
import Home from './pages/Home';
import Lazer from './pages/Lazer';
import Localizacao from './pages/Localizacao';
import Maquete from './pages/Maquete';
import Parceiro from './pages/Parceiro';
import Plantas from './pages/Plantas';
import Torre from './pages/Torre';

export default function App() {
  const location = useLocation();
  const { secao, titulo, home } = secaoAtual(location.pathname);
  const naHome = location.pathname === '/';

  // Com a Home pronta: aquece imagens e libera a preparacao da Maquete (Electron).
  useEffect(() => {
    window.totem?.appReady();
    return preloadImagens();
  }, []);

  return (
    <div className="shell" data-tema={secao.tema} data-pagina={secao.id} data-home={naHome}>
      <header className="shell-head">
        <span className="head-num">{secao.num}</span>
        <span className="head-title">{titulo}</span>
        {!home && (
          <span className="brand-mini" aria-hidden="true">
            <strong>DUX</strong>
            <span>JARDIM SÃO PAULO</span>
          </span>
        )}
      </header>

      <main className="shell-body">
        <div className="page-wrap" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/parceiro/:id" element={<Parceiro />} />
            <Route path="/localizacao" element={<Localizacao />} />
            <Route path="/ficha-tecnica" element={<FichaTecnica />} />
            <Route path="/ficha-tecnica/:torre" element={<Torre />} />
            <Route path="/fachada" element={<Fachada />} />
            <Route path="/lazer" element={<Lazer />} />
            <Route path="/plantas" element={<Plantas />} />
            <Route path="/maquete" element={<Maquete />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <Nav />
      <IdleGuard />
    </div>
  );
}
