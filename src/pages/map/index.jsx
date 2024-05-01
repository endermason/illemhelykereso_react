import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminUser, auth } from '../../config/firebase';
import Mbox from '../../components/mbox';
import { downloadPlaces } from '../../components/fbtojson';
import '../../index.css';
import { Container, Col, Row, Button, Card } from 'react-bootstrap';
import Navigationbar from '../navbar';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Form from 'react-bootstrap/Form';
import AuthContext from '../../contexts/logoutcontext';
import { useContext } from 'react';
import { days } from '../places';
import Filters from '../../components/filters';
import PlaceStatusAlert from "../../components/alert"


export const Map = () => {
    const { currentUser } = useContext(AuthContext);

    const [selectedPlace, setSelectedPlace] = useState(null);
    const [me, setMe] = useState(null);
    const [route, setRoute] = useState(null);
    const [instructions, setInstructions] = useState(null);
    const [distance, setDistance] = useState(null);
    

    const getRoute = async (end) => {
        const query = await fetch(
            //`https://api.mapbox.com/directions/v5/mapbox/walking/17.638832149211858,47.679272511881216;${end[0]},${end[1]}?steps=true&walkway_bias=1&overview=full&language=hu&geometries=geojson&access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`,
            `https://api.mapbox.com/directions/v5/mapbox/walking/${me.longitude},${me.latitude};${end[0]},${end[1]}?steps=true&walkway_bias=1&overview=full&language=hu&geometries=geojson&access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`,
            { method: 'GET' }
        );
        const json = await query.json();
        setRoute(json);

        const instructions = json.routes[0].legs[0].steps.map(step => step.maneuver.instruction);
        setInstructions(instructions);

        const distance = json.routes[0].distance;
        setDistance(distance);
    };


    //useEffect(() => { document.title = t("signup-title") + " | " + t("app-name"); });


    const [filterFunction, setFilterFunction] = useState(() => (place) => true);


    
    return (
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr", height: "100vh" }}>
            <div>
                <Navigationbar />
            </div>
            <div style={{ position: "relative", height: "100%" }}>
                <Mbox onClick={(place) => {
                    setSelectedPlace(place);
                    setRoute(null);
                    setInstructions(null);
                    setDistance(null);
                }} filter={filterFunction} setMe={setMe} route={route} /> {/* mbox.js script funkciója, megcsinálja a térképet és a markereket */}
                

                {selectedPlace && (<>
                    <Container style={{ zIndex: 5, backgroundColor: "white", position: "absolute", top: 0, left: 0, padding: '1em', width: "30vw" }}>

                        {/* {currentUser ? <p>Logged in as {currentUser.email}</p> : <p>No user logged in</p>} */}

                        <Row className='' >
                            <PlaceStatusAlert selectedPlace={selectedPlace} />
                            <h2>{selectedPlace.name}</h2>
                            <p>{selectedPlace.description}</p>
                            <p>{selectedPlace.address}</p>
                            <ul>
                                {selectedPlace.opening_times.map((time, index) => {
                                    return <li key={index}>{`${days[index]}: ${time}`}</li>;
                                })}
                            </ul>
                            <p>{selectedPlace.price === 0 || selectedPlace.price === "" || selectedPlace.price === null ? "Ingyenes" : `${selectedPlace.price} forint`}</p>
                            <p>{selectedPlace.accessible ? "Akadálymentes" : "Nem akadálymentes"}</p>
                            <p>{selectedPlace.public ? "Nyilvános" : "Privát"}</p>
                            <p>{selectedPlace.rating_calculated === -1 ? "Nincs értékelés" : selectedPlace.rating_calculated.toFixed(2)}</p>
                            {currentUser && me && // ha be van jelentkezve a felhasználó, akkor megjelenik a navigáció gomb
                                <Button onClick={() => getRoute([selectedPlace.longitude, selectedPlace.latitude])}>Vezess el ide!</Button>
                            }

                            {instructions && (
                                <div style={{ maxHeight: "40vh", overflow: "auto" }}>
                                    <ol>
                                        {instructions.map((instruction, index) => (
                                            <li key={index}>{instruction}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                            {distance && <p>{distance} m</p>}
                        </Row>
                        {selectedPlace ? <Button onClick={() => setSelectedPlace(null)}>Bezárás</Button> : null}
                    </Container>
                </>)}
                <Row style={{ zIndex: 5, position: "absolute", bottom: 30, left: 0, padding: '1em' }}>
                    <div style={{ backgroundColor: "white" }} className="p-2 rounded">
                        <Filters setFilterFunction={setFilterFunction} />
                    </div>
                </Row>
            </div>
        </div>
    );
}
