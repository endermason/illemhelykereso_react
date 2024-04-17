import { useEffect, useState, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { db, adminUser } from "../config/firebase";
import { getDocs, collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Button, Card, Container, Row } from "react-bootstrap";
import { AddressAutofill, AddressMinimap, useConfirmAddress, config } from '@mapbox/search-js-react';
import styles from '../Mapbox.module.css';

export function Place() {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const [placeList, setPlaceList] = useState([]);

    // New Place States

    const [newPlacePrice, setNewPlacePrice] = useState(0)
    const [newPlaceComments, setNewPlaceComments] = useState("");
    const [newPlaceAccessible, setNewPlaceAccessible] = useState(false);
    const [newPlaceAccepted, setNewPlaceAccepted] = useState(false);
    const [newPlaceOpenHours, setNewPlaceOpenHours] = useState("");
    const [newPlacePublic, setNewPlacePublic] = useState(false);

    // Update Place States

    const [updatedPlaceAccepted, setUpdatedPlaceAccepted] = useState(false);

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

    const deletePlace = async (id) => {
        const placeDoc = doc(db, "places", id);
        await deleteDoc(placeDoc);
    };

    const acceptPlace = async (id) => {
        const placeDoc = doc(db, "places", id);
        await updateDoc(placeDoc, { accepted: true });
    }

    const [showFormExpanded, setShowFormExpanded] = useState(false);
    const [showMinimap, setShowMinimap] = useState(false);
    const [feature, setFeature] = useState();

    useEffect(() => {
        config.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    }, [])

    const { formRef } = useConfirmAddress({
        minimap: true,
        skipConfirmModal: (feature) => {
            ['exact', 'high'].includes(feature.properties.match_code.confidence)
        }
    });

    const handleRetrieve = useCallback(
        (res) => {
            const feature = res.features[0];
            setFeature(feature);
            setShowMinimap(true);
            setShowFormExpanded(true);
        },
        [setFeature, setShowMinimap]
    );

    function handleSaveMarkerLocation(coordinate) {
        setFeature((prev) => ({
            ...prev,
            geometry: {
                ...prev.geometry,
                coordinates: [coordinate[0], coordinate[1]]
            }
        }));
    }

    const onSubmitPlace = async (e) => {
        e.preventDefault();
        try {
            console.log(feature)


            await addDoc(placeCollectionRef,
                {
                    country: feature.properties.country,
                    city: feature.properties.place,
                    address: feature.properties.street + " " + feature.properties.address_number,
                    price: newPlacePrice,
                    comments: newPlaceComments,
                    accessible: newPlaceAccessible,
                    accepted: newPlaceAccepted,
                    latitude: feature.geometry.coordinates[1],
                    longitude: feature.geometry.coordinates[0],
                    openHours: newPlaceOpenHours,
                    public: newPlacePublic,
                    added: serverTimestamp()


                });

            getPlaceList(); // A lista frissítése


            const inputs = document.querySelectorAll("input");
            inputs.forEach(input => input.value = "");
            setShowFormExpanded(false);
            //setShowValidationText(false);
            setFeature(null);
        }
        catch (err) {
            console.error(err);
        }
    };
    
    function resetForm() {
        const inputs = document.querySelectorAll("input");
        inputs.forEach(input => input.value = "");
        setShowFormExpanded(false);
        setFeature(null);
      }

    useEffect(() => {
        getPlaceList();
    }, [onSubmitPlace]);

    return (
        <Container className="Places">
            <h2>Places</h2>
            {currentUser ? <p>Logged in as {currentUser.email}</p> : <p>No user logged in</p>}
            {currentUser ? <p>userID: {currentUser.uid}</p> : <p>No user logged in</p>}

            <div>
                <Row>
                    <form ref={formRef} className="flex flex--column" onSubmit={onSubmitPlace} >

                        <input placeholder="Ár..." type="number" onChange={(e) => setNewPlacePrice(Number(e.target.value))} />
                        <input placeholder="Megjegyzés..." onChange={(e) => setNewPlaceComments(e.target.value)} />
                        <input placeholder="Akadálymentes?" type="checkbox" checked={newPlaceAccessible} onChange={(e) => setNewPlaceAccessible(e.target.checked)} />
                        <label>Akadálymentes?</label>
                        <br />
                        <input placeholder="Elfogadva?" type="checkbox" checked={newPlaceAccepted} onChange={(e) => setNewPlaceAccepted(e.target.checked)} />
                        <label>Elfogadva?</label>
                        <input placeholder="Nyitvatartás..." onChange={(e) => setNewPlaceOpenHours(e.target.value)} />
                        <input placeholder="Publikus?" type="checkbox" checked={newPlacePublic} onChange={(e) => setNewPlacePublic(e.target.checked)} />
                        <label>Publikus?</label>

                        <div className={styles.mapbox}>
                            <div className="grid grid--gut24 mb60">
                                <div className="col col--auto-mm w-full">

                                    {/* Input form */}
                                    <label className="txt-s txt-bold color-gray mb3">Cím</label>
                                    <AddressAutofill accessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN} onRetrieve={handleRetrieve}>
                                        <input
                                            className="input mb12"
                                            placeholder="Adjon meg egy címet, pl. 9026 Győr, Egyetem tér 1."
                                            autoComplete="address-line1"
                                            id="mapbox-autofill"
                                        />
                                    </AddressAutofill>
                                    {!showFormExpanded &&
                                        <div
                                            id="manual-entry"
                                            className="w180 mt6 link txt-ms border-b color-gray color-black-on-hover"
                                            onClick={() => setShowFormExpanded(true)}
                                        >
                                            Adjon meg egy címet
                                        </div>
                                    }
                                    <div className="secondary-inputs" style={{ display: showFormExpanded ? 'block' : 'none' }}>
                                        <label className="txt-s txt-bold color-gray mb3">Cím 2. sora</label>
                                        <input
                                            className="input mb12"
                                            placeholder="Épület, emelet, ajtó, stb."
                                            autoComplete="address-line2"
                                        />
                                        <label className="txt-s txt-bold color-gray mb3">Település</label>
                                        <input
                                            className="input mb12"
                                            placeholder="Település"
                                            autoComplete="address-level2"
                                        />
                                        <label className="txt-s txt-bold color-gray mb3"
                                        >Állam/Régió</label
                                        >
                                        <input
                                            className="input mb12"
                                            placeholder="Állam/Régió"
                                            autoComplete="address-level1"
                                        />
                                        <label className="txt-s txt-bold color-gray mb3"
                                        >Irányítószám</label
                                        >
                                        <input
                                            className="input"
                                            placeholder="Irányítószám"
                                            autoComplete="postal-code"
                                        />
                                    </div>
                                </div>
                                <div className="col col--auto-mm">
                                    {/* Visual confirmation map */}
                                    <div
                                        id="minimap-container"
                                        className="h240 w360 relative mt18"
                                    >
                                        <AddressMinimap
                                            canAdjustMarker={true}
                                            satelliteToggle={true}
                                            feature={feature}
                                            show={showMinimap}
                                            onSaveMarkerLocation={handleSaveMarkerLocation}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form buttons */}
                        {showFormExpanded &&
                            <div className="mb30 submit-btns">
                                <button type="submit" className="btn round" id="btn-confirm">
                                    Hely hozzáadása
                                </button>
                                <button type="button" className="btn round btn--gray-light ml3" id="btn-reset" onClick={resetForm}>
                                    Visszaállítás
                                </button>
                            </div>
                        }
                    </form>

                </Row>
                {placeList.map((place) => (
                    place.accepted || (currentUser && currentUser.uid === adminUser)) && (
                        <div key={place.id} style={{ marginBottom: "3rem" }}>
                            <Card border="secondary" style={{ backgroundColor: "lightblue", borderRadius: "2rem" }}>
                                <Card.Body>
                                    <Card.Title>{place.city}, {place.address}</Card.Title>
                                    <Card.Subtitle style={{ marginBottom: "1rem" }}>{place.comments}</Card.Subtitle>
                                    <Card.Text>
                                        {place.public ? "Publikus " : "Privát "}
                                        {place.openHours}
                                        {currentUser == adminUser ? place.accepted : ""}
                                    </Card.Text>

                                    {currentUser && currentUser.uid === adminUser && (
                                        <>
                                            <Button onClick={() => deletePlace(place.id)}>Hely törlése</Button>
                                            <Button onClick={() => acceptPlace(place.id)}>Hely elfogadása</Button>
                                        </>
                                    )}
                                </Card.Body>
                            </Card>
                        </div>
                    ))}

            </div>
        </Container>
    );
}
// Tudok-e csinálni olyat, hogy bizonyos gombokat/formokat csak az admin felhasználók lássanak? Mondjuk id-vel? 