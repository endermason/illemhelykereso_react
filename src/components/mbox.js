import mapboxgl from 'mapbox-gl';
import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import geoJson from '../helyek.json';
import '../Map.css';


mapboxgl.accessToken = 'pk.eyJ1IjoiZW5kZXJtYXNvbiIsImEiOiJjbDh1c3E2Y20wN2FuM3BvZzhxYW4zNndpIn0.MWkq3OWmG-285QQQ318pfg';


const Marker = ({ onClick, children, feature }) => {
    const _onClick = () => {
        onClick(feature.properties.description);
    };

    return (
        <button onClick={_onClick} className="marker">
            {children}
        </button>
    );
};

const Mbox = () => {
    const mapContainerRef = useRef(null);

    // Initialize map when component mounts
    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-87.65, 41.84],
            zoom: 10,
        });

        // Render custom marker components
        geoJson.features.forEach((feature) => {
            // Create a React ref
            const ref = React.createRef();
            // Create a new DOM node and save it to the React ref
            ref.current = document.createElement('div');
            // Render a Marker Component on our new DOM node
            createRoot(ref.current).render(
                <Marker onClick={markerClicked} feature={feature} />
            );

            // Create a Mapbox Marker at our new DOM node
            new mapboxgl.Marker(ref.current)
                .setLngLat(feature.geometry.coordinates)
                .addTo(map);
        });

        // Add navigation control (the +/- zoom buttons)
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Clean up on unmount
        return () => map.remove();
    }, []);

    const markerClicked = (title) => {
        window.alert(title);
    };

    return <div className="map-container" ref={mapContainerRef} />;
    
};

export default Mbox;