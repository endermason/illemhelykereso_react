import { Container } from "react-bootstrap";
import "./App.css";
import { Auth } from "./components/auth";
import Signup from "./components/signup";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/dashboard";

function App() {
  return (
  //<div className="App">
    //<Auth />
    //<Signup/>
  //</div>
  <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  <div style={{ maxWidth: '600px', minWidth: '400px' }}>
    <Router>
      <AuthProvider>
        <Routes>
          <Route exact path="/" element={<Dashboard/>}/>
          <Route path="/signup" element={<Signup/>}/>
        </Routes>
      </AuthProvider>
    </Router>
  </div>
</Container>
    
    
  
  );
}

export default App;