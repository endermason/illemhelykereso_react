import { useEffect} from 'react'
import { useTranslation, Trans } from 'react-i18next';
import { Button, Form, Alert, Accordion, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Guide() {
  const { t, i18n } = useTranslation();
  useEffect(() => { document.title = t("nav.guide") + " | " + t("nav.main"); });
  return (
    <>
      <Container>
        <center>
          <h1>{t("nav.guide")}</h1>
          {i18n.resolvedLanguage === "de" && <p>Die Hilfeseite ist derzeit nur auf Ungarisch verfügbar.</p>}
          {i18n.resolvedLanguage === "en" && <p>The Help page is currently only available in Hungarian.</p>}
          <p>
            Üdvözlünk az Illemhelykereső útmutató oldalán! Ha bármilyen kérdésed van, kérjük, olvasd el az alábbi útmutatót, vagy vedd fel velünk a kapcsolatot <a href="mailto:admin@illemhelykereso.hu">e-mailen</a>.
          </p>
        </center>


        <Accordion className="mb-3">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Regisztráció</Accordion.Header>
            <Accordion.Body style={{ textAlign: "left" }}>
              <p>
                Az Illemhelykereső oldal használatához nem kötelező regisztrálni, de a regisztrált felhasználók több funkciót érhetnek el.
                Például segíthetik a helyeket tartalamazó adatbázis bővítését új helyek hozzáadásával, értékelhetik a helyeket, valamint használhatják a térképhez tartozó navigációs funkciót is, amely segít a kiválasztott hely elérésében.
              </p>
              <p>
                Fontos: a regisztrációnál megadott e-mail címet és jelszavat bizalmasan kezeljük, és semmilyen körülmények között nem adjuk ki harmadik félnek. Továbbá a jelszavadat titkosítva tároljuk, így az csak neked lesz elérhető.
                Az e-mail címedre kizárólag a fiókodhoz kapcsolódó fontos információkat küldünk el, például a jelszóvisszaállító linket, ha azt kéred.
              </p>

              <b>A regisztrációhoz</b> kövesd ezeket a lépéseket:
              <ol className="guide-list">
                <li>Regisztrálni a rgisztráció aloldalon tudsz, ami a <b>navigációs fül jobb oldalán</b> található. Vagy <Link to="/register">ide</Link> kattintva.</li>
                <li>Elsőként meg kell adnod az <b>e-mail címedet</b>, amivel a továbbiakban be tudsz jelentkezni.</li>
                <li>Ezután a jelszavadt kell megadnod. A jelszónak <b>8-20 karakter hosszúnak</b> kell lennie, és tartalmaznia kell legalább egy <b>számot</b>, egy <b>kisbetűt</b>, egy <b>nagybetűt</b> és egy <b>speciális karaktert</b>.</li>
                <li>Ezt követően add meg a <b>jelszavadat újra</b> a megerősítéshez.</li>
                <li>Ha minden adatot megadtál, kattints a <b>Regisztráció</b> gombra.</li>
                <li>Ha sikeres volt a regisztráció, a rendszer visszairányít a főoldalra, ahol már be is vagy jelentkezve.</li>
              </ol>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>Bejelentkezés és elfelejtett jelszó</Accordion.Header>
            <Accordion.Body style={{ textAlign: "left" }} >
              <p>
                Amennyiben már regisztráltál az Illemhelykereső oldalán, be tudsz jelentkezni a fiókodba.
              </p>

              <b>Hogy bejelentkezhess</b>,kövesd ezeket a lépéseket:
              <ol className="guide-list">
                <li>Bejelentkezni a bejelentkezési oldalon tudsz, ami a <b>navigációs fül jobb oldalán</b> található. Vagy <Link to="/login">ide</Link> kattintva.</li>
                <li>Elsőként add meg az <b>e-mail címedet</b>, amivel regisztráltál.</li>
                <li>Ezután add meg a <b>jelszavadat</b>, amit a regisztrációnál megadtál.</li>
                <li>Ha minden adatot megadtál, kattints a <b>Bejelentkezés</b> gombra.</li>
                <li>Ha sikeres volt a bejelentkezés, a rendszer visszairányít a főoldalra, ahol már be is vagy jelentkezve.</li>
              </ol>

              <b>Ha elfelejtetted a jelszavadat</b>, vissza tudod állítani a következő lépésekkel:
              <ol>
                <li>A <b>bejelentkezési oldalon</b> elhelyezett linkre vagy a <Link to="/forgotpassword">ide</Link> kattintva eljutsz a <b>jelszóvisszaállító oldalra</b>.</li>
                <li>Itt add meg az <b>e-mail címedet</b>, amivel regisztráltál.</li>
                <li>Kattints a <b>Jelszó visszaállítása</b> gombra.</li>
                <li>Amennyiben az e-mail címed szerepel az adatbázisunkban, a rendszer elküld egy e-mailt a jelszóvisszaállító linkkel.</li>
                <li>A linkre kattintva meg tudod adni az új jelszavadat.</li>
              </ol>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>Valami más</Accordion.Header>
            <Accordion.Body>
              <p> Valami más szöveggel</p>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Container>
    </>
  );
}

