import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useContext } from 'react';
import AuthContext from '../contexts/logoutcontext';
import { Link } from "react-router-dom";
import { adminUser } from '../config/firebase';
import { useTranslation, Trans } from 'react-i18next';

const lngs = {
  hu: { nativeName: 'Magyar' },
  en: { nativeName: 'English' },
  de: { nativeName: 'Deutsch' }
};

function Navigationbar() {
  const { t, i18n } = useTranslation();
  const { currentUser, logOut } = useContext(AuthContext);
  
  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand as={Link} to="/"><Trans i18nKey={"nav.main"}>Illemhelykereső</Trans></Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/places">{t('nav.places')}</Nav.Link>
            <Nav.Link as={Link} to="/guide">{t('nav.guide')}</Nav.Link> {/* Útmutató, még nem biztos, hogy lesz */}
          </Nav>
          <Navbar.Text>
            {currentUser && currentUser.uid === adminUser ?
              "Bejelentkezve mint: Admin" :
              currentUser ? `Bejelentkezve mint: ${currentUser.email}` : ""
            }
            
          </Navbar.Text>
          <Nav>
            {!currentUser && <Nav.Link as={Link} to="/login">{t('nav.login')}</Nav.Link>}
            {!currentUser && <Nav.Link as={Link} to="/register">{t('nav.register')}</Nav.Link>}
            {currentUser && <Nav.Link onClick={logOut}>{t('nav.logout')}</Nav.Link>}
          </Nav>
          <NavDropdown title={lngs[i18n.resolvedLanguage].nativeName} id="collasible-nav-dropdown">
            {Object.keys(lngs).map((lng) => (
              <NavDropdown.Item key={lng} onClick={() => i18n.changeLanguage(lng)}>{lngs[lng].nativeName}</NavDropdown.Item>
            ))}
          </NavDropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigationbar;