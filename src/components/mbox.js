import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
// import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
// import geoJson from '../helyek.json';
import '../Map.css';
import { db, adminUser } from "../config/firebase";
import { getDocs, collection } from "firebase/firestore";
// import ReactMapGl, { FullscreenControl, GeolocateControl, Source, Layer } from 'react-map-gl';
import { getAuth } from 'firebase/auth';

mapboxgl.accessToken = 'pk.eyJ1IjoiZW5kZXJtYXNvbiIsImEiOiJjbDh1c3E2Y20wN2FuM3BvZzhxYW4zNndpIn0.MWkq3OWmG-285QQQ318pfg';

const auth = getAuth();
const currentUser = auth.currentUser;

const Marker = ({ onClick, children, feature }) => {
    const _onClick = () => {
        onClick(feature);
    };

    return (
        <button onClick={_onClick} className="marker">
            {children}
        </button>
    );
};

const Mbox = ({ onClick, filter }) => {
    const mapContainerRef = useRef(null);
    const [json, setJson] = useState([]);
    const [filtered, setFiltered] = useState([]);

    useEffect(() => {
        const fetchPlaces = async () => {
            const placesCollection = collection(db, "places");
            const placesSnapshot = await getDocs(placesCollection);
            let placesList = placesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

            if (currentUser == null || currentUser.uid !== adminUser) { // KÉRDÉSES, HOGY EZ MŰKÖDIK-E NORMÁLISAN
                placesList = placesList.filter(place => place.accepted);
            }

            // Store data in constants
            const constants = placesList.reduce((acc, place) => {
                acc[place.id] = place;
                acc[place.id].coordinates = [place.longitude, place.latitude];

                if (!place.ratings) place.ratings = {};
                const ratings = Object.keys(place.ratings);
                acc[place.id].rating = ratings.reduce((acc, rating) => acc + place.ratings[rating], 0) / ratings.length;
                return acc;
            }, {});

            setJson(constants);
            setFiltered(constants);

        };

        fetchPlaces();

    }, []);

    // Initialize map when component mounts
    useEffect(() => {
        if (!filtered) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [17.63517, 47.68329],
            zoom: 10,
        });

        // map.on('load', function () {
        //     map.addImage(
        //         "../marker.svg",
        //         function(error, image) {
        //             if (error) throw error;
        //             map.addImage("custom-marker", image);
        //             map.addSource("places", {
        //                 type: "geojson",
        //                 data: {
        //                     type: "FeatureCollection",
        //                     features: Object.keys(filtered).map((key) => {
        //                         return {
        //                             type: "Feature",
        //                             geometry: {
        //                                 type: "Point",
        //                                 coordinates: filtered[key].coordinates,
        //                             },
        //                             properties: {
        //                                 title: filtered[key].name,
        //                                 description: filtered[key].description,
        //                                 id: key,
        //                             },
        //                         };
        //                     }),
        //                 },
        //             });
        //             map.addLayer({
        //                 id: "places",
        //                 type: "symbol",
        //                 source: "places",
        //                 layout: {
        //                     "icon-image": "custom-marker",
        //                     "icon-allow-overlap": true,
        //                 },
        //             });
        //         }
        //     )
        // });

        // Render custom marker components
        Object.keys(filtered).forEach((key) => {
            // Create a React ref
            const ref = React.createRef();
            // Create a new DOM node and save it to the React ref
            ref.current = document.createElement('div');

            const feature = filtered[key];

            // Render a Marker Component on our new DOM node
            createRoot(ref.current).render(
                <Marker onClick={onClick} feature={feature} />
            );

            // Create a Mapbox Marker at our new DOM node
            new mapboxgl.Marker(ref.current)
                .setLngLat(feature.coordinates)
                .addTo(map);
        });

        // Add navigation control (the +/- zoom buttons)
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');



        // Clean up on unmount
        return () => map.remove();
    }, [filtered]);

    useEffect(() => {
        const filtered2 = Object.keys(json).reduce((acc, key) => {
            if (filter(json[key])) {
                acc[key] = json[key];
            }
            return acc;
        }, {});
        setFiltered(filtered2);
    }, [json, filter])

    return <div className="map-container" ref={mapContainerRef} style={{ height: "inherit"}} />;

};

export default Mbox;