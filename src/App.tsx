import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ControlsPage from './pages/ControlsPage';
import DeckPage from './pages/DeckPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/deck" element={<DeckPage />} />
        <Route path="/controls" element={<ControlsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
