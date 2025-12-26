import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  return (
    <div>
      <nav className='p-4 bg-gray-800 text-white flex gap-4 justify-center'>
        <Link to='/' className='hover:text-gray-300'>
          Home
        </Link>
        <Link to='/about' className='hover:text-gray-300'>
          About
        </Link>
      </nav>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
