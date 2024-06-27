import { db } from "../config/firebase";
import { getDocs, collection } from "firebase/firestore";

export async function downloadPlaces() {
    try {
        const placesCollection = collection(db, "places");  // A Firestore collection referencia
        const placesSnapshot = await getDocs(placesCollection);     // Az adatok lekérése a Firestore-ból
        const placesList = placesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })); // Az adatok feldolgozása, hozzáadva az id-t

        // Store data in constants
        const constants = placesList.reduce((acc, place) => {
            let p = place;
            p.coordinates = [place.longitude, place.latitude];

            if (place.rating === undefined || Object.keys(place.rating).length === 0) {
                p.rating_calculated = -1;  // Ha nincs értékelés, akkor -1 a rating
            } else {
                const ratings = Object.keys(place.rating);
                p.rating_calculated = ratings.reduce((acc, rating) => acc + place.rating[rating].rating, 0) / ratings.length
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

