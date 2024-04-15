import './App.css';
import { Auth } from "./pages/auth/index";
import { Signup } from './pages/auth/register';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Map } from "./pages/map";
import { Places } from './pages/places/places';

function App() 
{
  return (
  <div className="App">
    <Router>
      <Routes>
        <Route path="/" index element={<Map />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/places" element={<Places />} />
      </Routes>
    </Router>
  </div>
  );
}

export default App;
