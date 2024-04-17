import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import Mbox from '../../components/mbox';
import { Hely } from '../../components/fbtojson';
import '../../index.css';
import { Container, Col, Row, Button, Card } from 'react-bootstrap';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import { Navbar } from 'react-bootstrap';

export const Map = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const [selectedPlace, setSelectedPlace] = useState(null);
    //useEffect(() => { document.title = t("signup-title") + " | " + t("app-name"); });

    const [filterFunction, setFilterFunction] = useState(() => (place) => true);
    return (
        
        <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
                
                <Hely /> {/* fbtojson script funkciója, lekéri az adatbázisból az adaokat és az objektumot átalakítja jsonba */}
                <Mbox onClick={(place) => {
                    setSelectedPlace(place);
                }} filter={filterFunction} /> {/* mbox.js script funkciója, megcsinálja a térképet és a markereket */}
              {/* A div a <div style={{ position: "fixed", zIndex: 1 }}></div> térkép fölé kerül */}

              <Container style={{ zIndex: 5, backgroundColor: "white", position: "fixed", top: 0, left: 0, padding: '1em', width: "30vw" }}>

                {currentUser ? <p>Logged in as {currentUser.email}</p> : <p>No user logged in</p>}

                <Row className='border' >
                    {selectedPlace && (<>
                        <h2>{selectedPlace.name}</h2>
                        <p>{selectedPlace.description}</p>
                        <p>{selectedPlace.address}</p>
                        <p>{selectedPlace.openingHours}</p>
                        <p>{selectedPlace.price}</p>
                        <p>{selectedPlace.accessible ? "Accessible" : "Not accessible"}</p>
                        <p>{selectedPlace.public ? "Public" : "Private"}</p>
                        <p>{isNaN(selectedPlace.rating) ? "Nincs értékelés" : selectedPlace.rating}</p>
                    </>
                    )}

                </Row>
                <Button onClick={() => setSelectedPlace(null)}>Bezárás</Button>
                &nbsp;
                <Button onClick={() => setFilterFunction(() => (place) => { return place.accessible })}>Akadálymentes</Button>
            </Container>
        </div>
    );
};


// [[8, 12], [8, 20], ]


// hétfő: mettől meddig
// ked: mettől meddig

/*
<Form.Group className="mb-3" controlId="isPrivate">
<Form.Label>{t("maze-visibility")}</Form.Label>
<Form.Check
    type="switch"
    label={!formData.isPrivate ? t("maze-public") : t("maze-private")}
    checked={!formData.isPrivate}
    onChange={(e) => handleChange(e.target.checked)}
    aria-describedby="isPrivateHelp"
/>
<Form.Text id="isPrivateHelp" className="text-muted">
    {t("maze-is-private-help")}
</Form.Text>
</Form.Group>
*/