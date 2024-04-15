import { useEffect, useState } from "react";
import { Auth } from "../components/auth";
import { db } from "../config/firebase";
import { getDocs, collection, addDoc } from "firebase/firestore";

export function Place() {
    const [placeList, setPlaceList] = useState([]);

// New Place States

    const [newPlaceCountry, setNewPlaceCountry] = useState("");
    const [newPlaceCity, setNewPlaceCity] = useState("");
    const [newPlaceAddress, setNewPlaceAddress] = useState("");
    const [newPlacePrice, setNewPlacePrice] = useState(0)
    const [newPlaceComments, setNewPlaceComments] = useState("");
    const [newPlaceAccessible, setNewPlaceAccessible] = useState(true);
    const [newPlaceAccepted, setNewPlaceAccepted] = useState(false);
    const [newPlaceLatitute, setNewPlaceLatitute] = useState(0);
    const [newPlaceLongitute, setNewPlaceLongitute] = useState(0);
    const [newPlaceOpenHours, setNewPlaceOpenHours] = useState("");
    const [newPlacePublic, setNewPlacePublic] = useState(true);

    const placeCollectionRef = collection(db, "places");

    const getPlaceList = async () => {
        try {
            const data = await getDocs(placeCollectionRef); // Az adatok lekérése a Firestore-ból
            const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id })); // Az adatok feldolgozása, hozzáadva az id-t
            // console.log(filteredData);
            setPlaceList(filteredData); // Az adatok beállítása a state-be
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getPlaceList();
    }, []);

    const onSubmitPlace = async () => {
        try {
        await addDoc(placeCollectionRef, 
            {country: newPlaceCountry,
             city: newPlaceCity,
             address: newPlaceAddress,
             price: newPlacePrice,
             comments: newPlaceComments,
             accessible: newPlaceAccessible,
             accepted: newPlaceAccepted,
             latitude: newPlaceLatitute,
             longitude: newPlaceLongitute,
             openHours: newPlaceOpenHours,
             public: newPlacePublic

            });

            getPlaceList(); // A lista frissítése
        }
        catch (err) 
        {
            console.error(err);
        }
    };


    return (
        <div className="Places">
            <h2>Places</h2>
            <div>
            <div>
                <input placeholder="Ország..." onChange={(e) => setNewPlaceCountry(e.target.value)}/> 
                <input placeholder="Város..." onChange={(e) => setNewPlaceCity(e.target.value)}/>
                <input placeholder="Cím..." onChange={(e) => setNewPlaceAddress(e.target.value)}/>
                <input placeholder="Ár..." type="number" onChange={(e) => setNewPlacePrice(Number(e.target.value))}/>
                <input placeholder="Megjegyzés..." onChange={(e) => setNewPlaceComments(e.target.value)}/>
                <input placeholder="Akadálymentes?" type="checkbox" checked={newPlaceAccessible} onChange={(e) => setNewPlaceAccessible(e.target.checked)}/>
                <label>Akadálymentes?</label>
                <button onClick={onSubmitPlace}>Új hely hozzáadása</button>

            </div>
                {placeList.map((place) => (
                   <div>
                    <h1 style={{color: place.accessible ? "green" : "red"}}>
                        {place.country}, {place.city}, {place.address}, {place.price} forint, {place.comments}
                    </h1>
                    

                   </div>     
                ))}
                        
            </div>
        </div>
    );
}