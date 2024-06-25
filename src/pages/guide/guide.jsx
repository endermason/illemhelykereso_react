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
          {i18n.resolvedLanguage === "de" && <p>Die Anleitung ist derzeit nur auf Ungarisch verfügbar.</p>}
          {i18n.resolvedLanguage === "en" && <p>The Guide page is currently only available in Hungarian.</p>}
          <p>
            Üdvözlünk az Illemhelykereső útmutató oldalán! Ha bármilyen kérdésed van, kérjük, olvasd el az alábbi útmutatót, vagy vedd fel velünk a kapcsolatot <a href="mailto:admin@illemhelykereso.hu">e-mailen</a>.
          </p>
          <p>
            <b>Fontos: az Illemhelykereső oldalának használatához nem szükséges regisztráció, de a regisztrált felhasználók több funkciót érhetnek el:</b>
          </p>
          <ul style={{ listStyleType: "circle", textAlign: "left", fontWeight: "bold" }}>
              <li>Segíthetik az adatbázis bővítését új helyek hozzáadásával.</li>
              <li>Véleményezhetik és értékelhetik a helyeket.</li>
              <li>Használhatják a térképhez tartozó navigációs funkciót, amely segít a kiválasztott hely elérésében.</li>
            </ul>
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
              <b>Fontos: a regisztrációnál megadott e-mail címet és jelszavat bizalmasan kezeljük, és semmilyen körülmények között nem adjuk ki harmadik félnek. Továbbá a jelszavadat titkosítva tároljuk, így az csak neked lesz elérhető.
                Az e-mail címedre kizárólag a fiókodhoz kapcsolódó fontos információkat küldünk el, például a jelszóvisszaállító linket, ha azt kéred.</b>
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
              <ol className="guide-list">
                <li>A <b>bejelentkezési oldalon</b> elhelyezett linkre vagy a <Link to="/forgotpassword">ide</Link> kattintva eljutsz a <b>jelszóvisszaállító oldalra</b>.</li>
                <li>Itt add meg az <b>e-mail címedet</b>, amivel regisztráltál.</li>
                <li>Kattints a <b>Jelszó visszaállítása</b> gombra.</li>
                <li>Amennyiben az e-mail címed szerepel az adatbázisunkban, a rendszer elküld egy <b>e-mailt a jelszóvisszaállító linkkel</b>.</li>
                <li><b>A linkre kattintva</b> megnyílik egy új oldal, ahol megadhatod az <b>új jelszavadat</b>.</li>
              </ol>
              <b>Új jelszó beállításánál </b>figyelj az alábbiakra:
              <ol className="guide-list">
              <li>A jelszónak <b>8-20 karakter hosszúnak</b> kell lennie, és tartalmaznia kell legalább egy <b>számot</b>, egy <b>kisbetűt</b>, egy <b>nagybetűt</b> és egy <b>speciális karaktert</b>.</li>
              <li>Ezután már csak az <b>új jelszavaddal</b> tudsz <Link to="/login">bejelentkezni</Link>.</li>
              </ol>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>Térkép használata</Accordion.Header>
            <Accordion.Body style={{ textAlign: "left" }}>
              <p> Az Illemhelykereső térképe az oldal alapértelmezett kezdőoldala. A térképen a helyek sárga színű ikonokkal vannak jelölve, amelyekre kattintva megjelennek a helyek adatai.</p>
              <p> A térkép használatához a következő funkciókat érheted el:</p>
              <ol className="guide-list">
                <li>A térkép <b>zoomolásához</b> használd az egér görgőjét, vagy a térkép jobb alsó sarkában található + és - gombokat. Érintőképernyős eszközökön a két ujjal történő összehúzás és széthúzás is működik.</li>
                <li>A térkép <b>mozgatásához</b> kattints a térképen, majd húzd az egeret a kívánt irányba. Érintőképernyős eszközökön az ujjaidat használd a térkép mozgatásához.</li>
                <li>A térkép betöltése után az oldal <b>engedélyt kér a helymeghatározásra</b>. Ha engedélyezed, a térkép megmutatja a jelenlegi tartózkodási helyedet. Ezután a térkép ráközelít a jelenlegi tartózkodási helyedre, hogy a <b>hozzád közel lévő helyeket</b> láthasd.</li>
                <li>A térképen található helyekre kattintva megjelennek a helyek adatai. A helyek adatai között megtalálható a hely <b>neve</b>, a <b>címe</b>, az <b>értékelése</b>, a <b>nyitvatartása</b>, valamint a <b>megjegyzés</b> mező, ahol a felhasználók további információkat adhatnak meg a helyről.</li>
                <li>A helyek adatai között található egy <b>Hely értékelése</b> gomb is, amelyre kattintva az adott helyet véleményezheted és értékelheted 1-5-ig terjedő skálán.</li>
                <li>Amennyiben a kiválasztott helyet már értékelték, az <b>Értékelések megtekintése</b> gombra kattintva megtekintheted az adott hely értékeléseit.</li>
                <li>A helyek adatai között található egy <b>Vezess el ide</b> gomb is, amelyre kattintva a térkép megmutatja gyalog a <b>leggyorsabb útvonalat</b> a kiválasztott helyre.</li>
                <li>A térkép használata során a térkép bal felső oldalán vagy esetenként a térkép alján található <b>szűrőkkel</b> szűrheted a helyeket az <b>ár</b>, az <b>akadálymentesség</b> és a <b>nyilvánosság</b> és az <b>jelenleg nyitvatartó helyek</b> alapján. A szűrők használatával <b>a térképen csak a kiválasztott szűrőknek megfelelő helyek</b> jelennek meg.</li>
                <li>A <b>Bezárás</b> gombra kattintva a hely adatai bezáródnak.</li>
              </ol>
            </Accordion.Body>
          </Accordion.Item><Accordion.Item eventKey="3">
            <Accordion.Header>Helyek böngészése</Accordion.Header>
            <Accordion.Body style={{ textAlign: "left" }}>
              <p>Az Illemhelykereső oldal "Helyek" aloldalán találhatóak az összes regisztrált helyek adatai. Az oldalon a helyek listáját láthatod, azok adatival együtt.</p>
              <ol className="guide-list">
                <li>A helyek listáját ugyanúgy tudod <b>szűrni</b>, mint a térképen. A szűrőkkel az <b>ár</b>, az <b>akadálymentesség</b> és a <b>nyilvánosság</b> és az <b>jelenleg nyitva tartó helyek</b> alapján tudod szűrni a helyeket.</li>
                <li>Továbbá lehetőséged van a helyeket <b>cím</b>, <b>értékelés</b> és a <b>hozzáadás időpontja</b> alapján is rendezni.</li>
                <li>A <b>"Hely értékelése"</b> gombra kattintva az adott helyet <b>véleményezheted</b> és <b>értékelheted</b> 1-5-ig terjedő skálán.</li>
                <li>Amennyiben a kiválasztott helyet már értékelték, az <b>"Értékelések megtekintése"</b> gombra kattintva <b>megtekintheted az adott hely értékeléseit</b>.</li>
              </ol>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="4">
            <Accordion.Header>Új hely hozzáadása</Accordion.Header>
            <Accordion.Body style={{ textAlign: "left" }}>
              <p>Az Illemhelykereső oldalon regisztrált felhasználók új helyeket is hozzáadhatnak az adatbázishoz. Így segíthetik a helyek adatbázisának bővítését, és más felhasználók is értesülhetnek az általad ajánlott helyekről.</p>
              <p><b>Fontos, hogy a hozzáadott helyet egy adminisztrátornak el kell fogadnia, hogy megjelenjen az oldalon.</b></p>
              <b>Új hely hozzáadásához</b> kövesd ezeket a lépéseket:
              <ol className="guide-list">
                <li>Új hely hozzáadásához először navigálj a <Link to="/places">Helyek</Link> oldalra a navigációs fülön keresztül.</li>
                <li>A Helyek oldalon kattints a <b>Illemhely hozzáadása</b> gombra.</li>
                <li>Ezt követően két lehetőséged van a hely hozzáadására: <b>cím alapján</b> vagy <b>térképes kiválasztással</b>.</li>
              </ol>
              <b>Cím alapján történő hozzáadásnál</b> kövesd ezeket a lépéseket:
              <ol className="guide-list">
                <li>Írd be a hely <b>címét</b> a <i>Cím</i> mezőbe.</li>
                <li>A cím beírása közben a rendszer megjeleníti a címhez tartozó lehetőségeket. <b>Válaszd ki a megfelelőt</b>.</li>
                <li>Ezután a rendszer automatikusan kitölti a hely cím többi részét. Kérjük, <b>ellenőrizd</b>, hogy minden adat helyesen lett-e kitöltve. <b>Ha szükséges, módosítsd</b> a címet az automatikusan kitöltött mezők szerkesztésével.</li>
                <li>A mezők mellett jobb oldalt megjelenik a térkép, ahol a cím alapján kiválasztott helyet egy jelölő megjeleníti. Ha a hely nem a megfelelő helyen jelenik meg, <b>módosítsd a jelölőt</b> a térképen.</li>
                <li>Add meg a helyhez tartozó <b>használati díjat</b> és <b>megjegyzést</b>, ha van. Jelöld a hely <b>akadálymentességét</b> és <b>típusát</b> a két jelölőnégyzet bepipálásával.</li>
                <li>Majd add meg a hely nyitvatartását. Fontos:</li>
                <ul style={{ listStyleType: "circle" }}>
                  <li><b>Ha a helynek megadott nyitvatartása van, akkor add meg a nyitvatartás kezdetét és végét a megfelelő mezőkben.</b></li>
                  <li><b>Ha a helynek nyitvatartása nincs megadva, akkor a <b>Nyitvatartás</b> mezőit hagyd üresen.</b></li>
                </ul>
                <li>Ha minden adatot megadtál, kattints a <b>Hely hozzáadása</b> gombra.</li>
              </ol>
              <b>Térképes kiválasztással történő hozzáadásnál</b> kövesd ezeket a lépéseket:
              <ol className="guide-list">
                <li>Kattints a <b>Térképes kiválasztással</b> fülre.</li>
                <li>A térképen <b>kattints a helyre</b>, ahol az illemhely található. A térkép automatikusan kitölti a hely címét.</li>
                <li>Ha a cím nem lett helyesen kitöltve, <b>módosítsd a címet</b> az automatikusan kitöltött mezők szerkesztésével.</li>
                <li>Add meg a helyhez tartozó <b>használati díjat</b> és <b>megjegyzést</b>, ha van. Jelöld a hely <b>akadálymentességét</b> és <b>típusát</b> a két jelölőnégyzet bepipálásával.</li>
                <li>Majd add meg a hely nyitvatartását. Fontos:</li>
                <ul style={{ listStyleType: "circle" }}>
                <li><b>Ha a helynek megadott nyitvatartása van, akkor add meg a nyitvatartás kezdetét és végét a megfelelő mezőkben.</b></li>
                <li><b>Ha a helynek nyitvatartása nincs megadva, akkor a <b>Nyitvatartás</b> mezőit hagyd üresen.</b></li>
                </ul>
                <li>Ha minden adatot megadtál, kattints a <b>Hely hozzáadása</b> gombra.</li>
              </ol>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Container>
    </>
  );
}

