import { Routes, Route } from 'react-router-dom';
import Home from './pages/home/Home';
import Canvas from './pages/canvas/Canvas';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/canvas" element={<Canvas />} />
    </Routes>
  );
}

export default App;
