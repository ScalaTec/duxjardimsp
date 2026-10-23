import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/localizacao" element={<Placeholder title="Localizacao" />} />
      <Route path="/ficha-tecnica" element={<Placeholder title="Ficha Tecnica" />} />
      <Route path="/fachada" element={<Placeholder title="Fachada" />} />
      <Route path="/lazer" element={<Placeholder title="Lazer" />} />
      <Route path="/plantas" element={<Placeholder title="Plantas" />} />
      <Route path="/maquete" element={<Placeholder title="Maquete Virtual" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
