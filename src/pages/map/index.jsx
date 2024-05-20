import React, { useState, useEffect, useRef } from 'react';
import '../../index.css';
import { Container, Col, Button, Accordion } from 'react-bootstrap';
import Navigationbar from '../navbar';
import AuthContext from '../../contexts/logoutcontext';
import { useContext } from 'react';
import { useDays } from '../places';
import Filters from '../../components/filters';
import PlaceStatusAlert from "../../components/alert"
import { useTranslation } from 'react-i18next';
import Review from "../../components/review";
import ShowReviews from "../../components/showreviews";
import '../../Map.css';
import { adminUser } from "../../config/firebase";
import { Map as MapBoxMap, NavigationControl, Marker, GeolocateControl, Layer, Source } from 'react-map-gl';
import { downloadPlaces } from "../../components/fbtojson";


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





    
    const mapContainerRef = useRef(null);
    const [original, setOriginal] = useState([]);
    const [filtered, setFiltered] = useState([]);

    
    const getPlaceList = async () => {
        let placesList = await downloadPlaces();

        if (currentUser == null || currentUser.uid !== adminUser) {
            placesList = placesList.filter(place => place.accepted);
        }

        setOriginal(placesList);

        if (selectedPlace !== null) {
            setSelectedPlace(placesList.find(place => place.id === selectedPlace.id));
        }
    };


    useEffect(() => {
        getPlaceList();
    }, [currentUser]);

    useEffect(() => {
        const newFiltered = original.reduce((acc, feature) => {
            if (filterFunction(feature)) {
                acc.push(feature);
            }
            return acc;
        }, []);
        setFiltered(newFiltered);
    }, [original, filterFunction]) //Külsős filter ablak dolgai


    const mapRef = useRef();
    const geoControlRef = useRef();

    const [routeJson, setRouteJson] = useState(null);

    const layer = {
        id: 'route',
        type: 'line',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
        }
    };


    useEffect(() => {
        if (route === null || route === undefined) {
            setRouteJson(null);
            return;
        }
    
        const data = route.routes[0].geometry.coordinates
        const geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: data
            }
        };
        setRouteJson(geojson);
    }, [route]);



    const onClick = (place) => {
            setSelectedPlace(place);
            setRoute(null);
            setInstructions(null);
            setDistance(null);
        };




    return (
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr", height: "100vh" }}>
            <div>
                <Navigationbar />
            </div>
            <div style={{ position: "relative", height: "100%" }}>
            <MapBoxMap
                ref={mapRef}
                mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                initialViewState={{
                    longitude: 19.504001543678186,
                    latitude: 47.18010736034033,
                    zoom: 7,
                }}
                onLoad={() => {
                    geoControlRef.current?.trigger();
                }}
                style={{ height: "100%"}}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                className="map-container"
            >
                {routeJson && <Source id="route" type="geojson" data={routeJson}>
                    <Layer {...layer} />
                </Source>
                }
                <GeolocateControl
                position="bottom-right" 
                ref={geoControlRef} 
                positionOptions={{ enableHighAccuracy: true }} 
                trackUserLocation={true} 
                showAccuracyCircle={false} 
                onGeolocate={(position) => {
                    setMe({
                        longitude: position.coords.longitude,
                        latitude: position.coords.latitude,
                    }
                            
                );
                }} />
                <NavigationControl position="bottom-right"  />
                {filtered && filtered.map((feature) => {
                    return (
                        <Marker
                            key={feature.id}
                            longitude={feature.coordinates[0]} latitude={feature.coordinates[1]} 
                            anchor="bottom" 
                            className="marker"
                            onClick={() => onClick(feature)}
                            style={{ cursor: "pointer" }}
                        >
                            {feature.accepted ? <img src="../marker.svg" alt="marker" height={24} width={24} /> : <img src="../marker-red.svg"  alt="marker" height={24} width={24} />} 
                            {/* Ha el van fogadva a hely, akkor zöld, ha nincs, akkor piros */}
                            </Marker>
                    );
                })}
                </MapBoxMap>
                

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
                                            {"🕓 "+t('map.openhours')+" 🕓"}
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
                            <p>{selectedPlace.price === 0 || selectedPlace.price === "" || selectedPlace.price === null ? ("😎 "+t('map.free')+" 😎") : `💸 ${selectedPlace.price} forint 💸`}</p>
                            <p>{selectedPlace.accessible ? "🦽 "+t('map.accessible')+" 🦽" : "🚫 "+t('map.notaccessible')+" 🚫"}</p>
                            <p>{selectedPlace.public ? "🏙️ "+t('map.public')+" 🏙️" : "🔐 "+t('map.private')+" 🔐"}</p>
                            <p>{selectedPlace.rating_calculated === -1 ? "🤔 "+t('map.norating')+" 🤔" : <>{"⭐ "+t('map.rating')} {selectedPlace.rating_calculated.toFixed(2)} ⭐</>}</p>
                            {currentUser && <Review place={selectedPlace} triggerUpdate={getPlaceList} />} {/*A hely értékelése*/}
                            <ShowReviews place={selectedPlace} /> {/*A hely értékelései*/}
                            {currentUser && me && // ha be van jelentkezve a felhasználó, akkor megjelenik a navigáció gomb
                                <><br/><Button variant="success" onClick={() => getRoute([selectedPlace.longitude, selectedPlace.latitude])} className='mb-3'>{t('map.navigatemehere')}</Button></>
                            }

                            {/* {instructions && (
                                <div style={{ maxHeight: "25vh", overflow: "auto" }}>
                                    <ol>
                                        {instructions.map((instruction, index) => (
                                            <li key={index}>{instruction}</li>  // navigációs utasítások
                                        ))}
                                    </ol>
                                </div>
                            )}
                            {distance && <p>{distance} m</p>} */}
                            <br /><Button variant="secondary" onClick={() => setSelectedPlace(null)} className='mb-3'>{t('map.close')}</Button>     {/* bezárás gomb */}
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
