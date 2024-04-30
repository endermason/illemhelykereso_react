import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { getDocs, collection } from "firebase/firestore";

export async function downloadPlaces() {
    /*
    try {
            const data = await getDocs(placeCollectionRef); // Az adatok lekérése a Firestore-ból
            const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id })); // Az adatok feldolgozása, hozzáadva az id-t
            // console.log(filteredData);
            setPlaceList(filteredData); // Az adatok beállítása a state-be
        } catch (err) {
            console.error(err);
        }
        */

    try {
        const placesCollection = collection(db, "places");
        const placesSnapshot = await getDocs(placesCollection);
        const placesList = placesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        // Store data in constants
        const constants = placesList.reduce((acc, place) => {
            let p = place;
            p.coordinates = [place.longitude, place.latitude];

            if (place.rating === undefined) {
                p.rating_calculated = -1;  // Ha nincs értékelés, akkor -1 a rating
            } else {
                const ratings = Object.keys(place.rating);
                p.rating_calculated = ratings.reduce((acc, rating) => acc + place.rating[rating], 0) / ratings.length
            }
            acc.push(p);
            return acc;
        }, []);
        
        return constants;
    } catch (err) {
        console.error(err);
        return [];
    }
}

