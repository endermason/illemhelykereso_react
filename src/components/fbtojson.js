import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { getDocs, collection } from "firebase/firestore";

export let jeson = {};
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
            
            jeson=(JSON.stringify(constants));

        };     
        
        fetchPlaces();
        
    }, []);
}

