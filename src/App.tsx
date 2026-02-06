import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimulationPage } from './pages/SimulationPage';
import { GuidesPage } from './pages/GuidesPage';
import { TestsPage } from './pages/TestsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SimulationPage />} />
        <Route path="/guides" element={<GuidesPage />} />
        <Route path="/tests" element={<TestsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
