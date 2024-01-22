import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './pages/home/Home';
import Canvas from './pages/canvas/Canvas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/canvas" element={<Canvas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
