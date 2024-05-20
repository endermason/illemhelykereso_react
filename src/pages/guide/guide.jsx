import React from 'react'
import { useTranslation, Trans } from 'react-i18next';
import { Button, Form, Alert, Accordion, Container} from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Guide() {
  const { t, i18n } = useTranslation();
  return (
    <>
    <Container>
      <center>
        <h1>{t("help-title")}</h1>
        <h1>{("Egyelőre valami sablon ☺")}</h1>
      </center>

      {/* {i18n.resolvedLanguage === "hu" && <p className="lead" style={{ fontWeight: "800" }}>A Segítség oldal jelenleg csak magyar nyelven érhető el.</p>} */}
      {i18n.resolvedLanguage === "de" && <p>Die Hilfeseite ist derzeit nur auf Ungarisch verfügbar.</p>}
      {i18n.resolvedLanguage === "en" && <p>The Help page is currently only available in Hungarian.</p>}

      <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Első</Accordion.Header>
          <Accordion.Body>
            <p>
              Valami bevezető
            </p>

              <b>To create an account</b>, follow these simple steps:
              <ol>
                <li>A regisztráció itt van: <Link to="/register">Regisztráció</Link>.</li>
                <li>Bla bla bla</li>
                <li>Bla bla bla</li>
                <li>Bla bla bla</li>
              </ol>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Bejelentkezés</Accordion.Header>
          <Accordion.Body>
            <p>
              A bejelentkezési oldal lehetővé teszi a felhasználók számára, hogy ...
            </p>

            <b>Hogy bejelentkezhess</b>,kövesd ezeket a lépéseket:
            <ol>
              <li>Bejelentkezni itt tudsz: <Link to="/login">Bejelentkezés</Link>.</li>
              <li>Bla bla bla</li>
              <li>Bla bla bla</li>
              <li>Bla bla bla</li>
              </ol>

            <b>Ha elfelejtetted a jelszavadat</b>, vissza tudod állítani a következő lépésekkel:
            <ol>
              <li>Mondjuk itt: <Link to="/forgotpassword">Elfelejtettem a jelszavam 🖕</Link>.</li>
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

