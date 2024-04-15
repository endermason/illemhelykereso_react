import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { getDocs, collection } from "firebase/firestore";

export function Hely() {
    const [places, setPlaces] = useState([]);

    useEffect(() => {
        const fetchPlaces = async () => {
            const placesCollection = collection(db, "places");
            const placesSnapshot = await getDocs(placesCollection);
            const placesList = placesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setPlaces(placesList);

            // Store data in constants
            const constants = placesList.reduce((acc, place) => {
                acc[place.id] = place;
                return acc;
            }, {});
            console.log(constants);    
        };
        
        fetchPlaces();
    }, []);

    return (
        <div style={{ position: "fixed", zIndex: 1 }}>
            {places.map(place => (
                <div key={place.id}>
                    <h2>{place.name}</h2>
                    <p>{place.description}</p>
                    {/* Render other place properties as needed */}
                </div>
            ))}
        </div>
    );
}