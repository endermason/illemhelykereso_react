import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useContext } from 'react';
import AuthContext from '../contexts/logoutcontext';
import { Link } from "react-router-dom";
import { adminUser } from '../config/firebase';


function Navigationbar() {
  const { currentUser, logOut } = useContext(AuthContext);
  
  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand as={Link} to="/">Illemhelykereső</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/places">Helyek</Nav.Link>
            <Nav.Link as={Link} to="/guide">Útmutató</Nav.Link> {/* Útmutató, még nem biztos, hogy lesz */}
          </Nav>
          <Navbar.Text>
            {currentUser && currentUser.uid === adminUser ?
              "Bejelentkezve mint: Admin" :
              currentUser ? `Bejelentkezve mint: ${currentUser.email}` : ""
            }
            
          </Navbar.Text>
          <Nav>
            {!currentUser && <Nav.Link as={Link} to="/login">Bejelentkezés</Nav.Link>}
            {!currentUser && <Nav.Link as={Link} to="/register">Regisztráció</Nav.Link>}
            {currentUser && <Nav.Link onClick={logOut}>Kijelentkezés</Nav.Link>}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigationbar;