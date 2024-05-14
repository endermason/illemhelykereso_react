import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
// import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
// import geoJson from '../helyek.json';
import '../Map.css';
import { db, adminUser } from "../config/firebase";
import { getDocs, collection } from "firebase/firestore";
// import ReactMapGl, { FullscreenControl, GeolocateControl, Source, Layer } from 'react-map-gl';
import Map, {NavigationControl, Marker, GeolocateControl, Layer, Source} from 'react-map-gl';
import { downloadPlaces } from './fbtojson';
import AuthContext from '../contexts/logoutcontext';
import { useContext } from 'react';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const Mbox = ({ onClick, filter, setMe, route, refresh }) => {
    const { currentUser } = useContext(AuthContext);
    
    const mapContainerRef = useRef(null);
    const [original, setOriginal] = useState([]);
    const [filtered, setFiltered] = useState([]);


    useEffect(() => {
        const fetchPlaces = async () => {
            let placesList = await downloadPlaces();

            if (currentUser == null || currentUser.uid !== adminUser) {
                placesList = placesList.filter(place => place.accepted);
            }

            setOriginal(placesList);
        };

        fetchPlaces();

    }, [refresh]);

    useEffect(() => {
        const newFiltered = original.reduce((acc, feature) => {
            if (filter(feature)) {
                acc.push(feature);
            }
            return acc;
        }, []);
        setFiltered(newFiltered);
    }, [original, filter]) //Külsős filter ablak dolgai


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
    
    return <Map
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
        </Map>;

    //return <div className="map-container" ref={mapContainerRef} style={{ height: "inherit"}} />;

};

export default Mbox;