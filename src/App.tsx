import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import InflationSimulator from './pages/InflationSimulator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/simulador-inflacao" element={<InflationSimulator />} />
        <Route path="/" element={<Navigate to="/simulador-inflacao" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
