import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import InflationSimulator from './pages/InflationSimulator';
import YieldSimulator from './pages/YieldSimulator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/simulador-inflacao" element={<InflationSimulator />} />
        <Route path="/simulador-rendimento" element={<YieldSimulator />} />
        <Route path="/" element={<Navigate to="/simulador-inflacao" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
