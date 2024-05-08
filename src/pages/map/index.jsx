import React, { useState, useEffect } from 'react';
import Mbox from '../../components/mbox';
import '../../index.css';
import { Container, Col, Row, Button, Card, Accordion } from 'react-bootstrap';
import Navigationbar from '../navbar';
import AuthContext from '../../contexts/logoutcontext';
import { useContext } from 'react';
import { useDays } from '../places';
import Filters from '../../components/filters';
import PlaceStatusAlert from "../../components/alert"
import { useTranslation } from 'react-i18next';


export const Map = () => {
    const { t } = useTranslation();
    const { currentUser } = useContext(AuthContext);
    const days = useDays();
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


                <Container style={{ zIndex: 5, backgroundColor: "white", position: "absolute", top: 0, left: 0, padding: '1em' }} className={selectedPlace ? 'extra-container info-container' : 'extra-container'}>
                    {selectedPlace && <>
                        <Col className='info-container'>
                            <PlaceStatusAlert selectedPlace={selectedPlace} />
                            <h2>{selectedPlace.name}</h2>
                            <p>{selectedPlace.description}</p>
                            <p>{selectedPlace.city}, {selectedPlace.address}</p>
                            <Accordion defaultActiveKey="0" flush>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>
                                        <center style={{ width: "100%", transform: "translateX(calc(var(--bs-accordion-btn-icon-width) / 2))" }}>
                                            {t('map.openhours')}
                                        </center>
                                    </Accordion.Header>
                                    <Accordion.Body style={{ transform: "translateX(calc(var(--bs-accordion-btn-icon-width) / -2))" }}>
                                        <ul>
                                            {selectedPlace.opening_times.map((time, index) => {
                                                return <li key={index}>{`${days[index]}: ${time}`}</li>;
                                            })}
                                        </ul>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            <p>{selectedPlace.price === 0 || selectedPlace.price === "" || selectedPlace.price === null ? t('map.free') : `${selectedPlace.price} forint`}</p>
                            <p>{selectedPlace.accessible ? t('map.accessible') : t('map.notaccessible')}</p>
                            <p>{selectedPlace.public ? t('map.public') : t('map.private')}</p>
                            <p>{selectedPlace.rating_calculated === -1 ? t('map.norating') : <>{t('map.rating')} {selectedPlace.rating_calculated.toFixed(2)}</>}</p>
                            {currentUser && me && // ha be van jelentkezve a felhasználó, akkor megjelenik a navigáció gomb
                                <Button onClick={() => getRoute([selectedPlace.longitude, selectedPlace.latitude])} className='mb-3'>{t('map.navigatemehere')}</Button>
                            }

                            {instructions && (
                                <div style={{ maxHeight: "25vh", overflow: "auto" }}>
                                    <ol>
                                        {instructions.map((instruction, index) => (
                                            <li key={index}>{instruction}</li>  // navigációs utasítások
                                        ))}
                                    </ol>
                                </div>
                            )}
                            {distance && <p>{distance} m</p>}
                            <br /><Button onClick={() => setSelectedPlace(null)} className='mb-3'>{t('map.close')}</Button>     {/* bezárás gomb */}
                            <span className="hr-sect filter-label">{t('map.filter')}</span> {/* szűrő címke */}
                        </Col>
                    </>}
                    <div className={selectedPlace ? "until-lg" : ""}>
                        <Filters setFilterFunction={setFilterFunction} />   {/* szűrők */}
                    </div>
                </Container>
            </div>
        </div>
    );
}
