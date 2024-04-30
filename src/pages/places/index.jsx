import { useEffect, useState, useCallback, useContext } from "react";
import { db, adminUser, auth } from "../../config/firebase";
import { getDocs, collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Button, Card, Container, Row, Col, Form, Dropdown, Pagination } from "react-bootstrap";
import { AddressAutofill, AddressMinimap, useConfirmAddress, config } from '@mapbox/search-js-react';
import styles from '../../Mapbox.module.css';
import AuthContext from "../../contexts/logoutcontext";
import { downloadPlaces } from '../../components/fbtojson';

export const days = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];

const Orders = {
    PLACE_ASC: "place-asc",
    PLACE_DESC: "place-desc",
    RATING_ASC: "rating-asc",
    RATING_DESC: "rating-desc",
    ADDED_ASC: "added-asc",
    ADDED_DESC: "added-desc",
}


export function Places() {
    const { currentUser } = useContext(AuthContext);

    const [placeList, setPlaceList] = useState([]);

    const [errorMessage, setErrorMessage] = useState(null);

    // New Place States

    const [newPlacePrice, setNewPlacePrice] = useState("")
    const [newPlaceComments, setNewPlaceComments] = useState("");
    const [newPlaceAccessible, setNewPlaceAccessible] = useState(false);
    const [newPlaceAccepted, setNewPlaceAccepted] = useState(false);
    const [newPlacePublic, setNewPlacePublic] = useState(false);

    // Update Place States

    const [updatedPlaceAccepted, setUpdatedPlaceAccepted] = useState(false);

    const placeCollectionRef = collection(db, "places");

    const getPlaceList = async () => {
        const data = await downloadPlaces();
        setPlaceList(data); // Az adatok beállítása a state-be;
    };

    const deletePlace = async (id) => {
        const placeDoc = doc(db, "places", id);
        await deleteDoc(placeDoc);
        getPlaceList();
    };

    const acceptPlace = async (id) => {
        const placeDoc = doc(db, "places", id);
        await updateDoc(placeDoc, { accepted: true });
        getPlaceList();
    }

    const [showAddPlaceExpanded, setShowAddPlaceExpanded] = useState(false);
    const [showFormExpanded, setShowFormExpanded] = useState(false);
    const [showMinimap, setShowMinimap] = useState(false);
    const [feature, setFeature] = useState();

    useEffect(() => {
        config.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
        getPlaceList();
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
        const existingPlace = placeList.find(
            (place) =>
                place.city.toLowerCase() === feature.properties.place.toLowerCase() &&
                place.address.toLowerCase() === (feature.properties.street + " " + feature.properties.address_number).toLowerCase()
        );

        if (existingPlace) {
            setErrorMessage("A hely már létezik vagy elfogadásra vár.");
        } else {
            setErrorMessage(null);
            try {
                await addDoc(placeCollectionRef,
                    {
                        country: feature.properties.country,
                        city: feature.properties.place,
                        address: feature.properties.street + " " + feature.properties.address_number,
                        price: Number(newPlacePrice),
                        comments: newPlaceComments,
                        accessible: newPlaceAccessible,
                        accepted: newPlaceAccepted || currentUser.uid === adminUser,
                        latitude: feature.geometry.coordinates[1],
                        longitude: feature.geometry.coordinates[0],
                        opening_times: newPlaceOpenHours.map((day) => `${day.intervalFrom}-${day.intervalTo}`),
                        public: newPlacePublic,
                        added: serverTimestamp()


                    });

                getPlaceList(); // A lista frissítése

                // Reset form
                setNewPlacePrice("");
                setNewPlaceComments("");
                setNewPlaceAccessible(false);
                setNewPlaceAccepted(false);
                setNewPlaceOpenHours([
                    { intervalFrom: "", intervalTo: "" },
                    { intervalFrom: "", intervalTo: "" },
                    { intervalFrom: "", intervalTo: "" },
                    { intervalFrom: "", intervalTo: "" },
                    { intervalFrom: "", intervalTo: "" },
                    { intervalFrom: "", intervalTo: "" },
                    { intervalFrom: "", intervalTo: "" },
                ]);
                setNewPlacePublic(false);
                setShowFormExpanded(false);
                //setShowValidationText(false);
                setFeature(null);
            }
            catch (err) {
                console.error(err);
            }
        }

    };

    function resetForm() {
        const inputs = document.querySelectorAll("input");
        inputs.forEach(input => input.value = "");
        setShowFormExpanded(false);
        setFeature(null);
        setShowAddPlaceExpanded(false);
    }

    const [newPlaceOpenHours, setNewPlaceOpenHours] = useState([
        { intervalFrom: "", intervalTo: "" },
        { intervalFrom: "", intervalTo: "" },
        { intervalFrom: "", intervalTo: "" },
        { intervalFrom: "", intervalTo: "" },
        { intervalFrom: "", intervalTo: "" },
        { intervalFrom: "", intervalTo: "" },
        { intervalFrom: "", intervalTo: "" }
    ]);


    //window.location -> helyhez



    //Sorting and pagination
    const [sortOrder, setSortOrder] = useState(Orders.ADDED_ASC);     //Rendezés sorrendje
    const [sortedPlaces, setSortedPlaces] = useState([]);   //Rendezett teljes lista
    const [pageNumbers, setPageNumbers] = useState([1]);    //Oldalszámok listája
    const [currentPage, setCurrentPage] = useState(1);      //Aktuális oldal sorszáma
    const [actualPlaces, setActualPlaces] = useState([]);   //Aktuális oldalon megjelenő elemek


    //Handle sorting order change
    const handleSortOrderChange = useCallback((order) => {
        let newSortedPlaces = [...placeList].filter((place) => place.accepted || (currentUser && currentUser.uid === adminUser)); //TODO extend with filter

        switch (order) {
            case Orders.PLACE_ASC:
                newSortedPlaces = newSortedPlaces.sort((a, b) => a.city.localeCompare(b.city));
                break;
            case Orders.PLACE_DESC:
                newSortedPlaces = newSortedPlaces.sort((a, b) => b.city.localeCompare(a.city));
                break;
            case Orders.RATING_ASC:
                newSortedPlaces = newSortedPlaces.sort((a, b) => {
                    if (a.rating === undefined) return 1;
                    if (b.rating === undefined) return -1;
                    return Object.values(a.rating).reduce((a, b) => a + b, 0) / Object.keys(a.rating).length - Object.values(b.rating).reduce((a, b) => a + b, 0) / Object.keys(b.rating).length;
                });
                break;
            case Orders.RATING_DESC:
                newSortedPlaces = newSortedPlaces.sort((a, b) => {
                    if (a.rating === undefined) return 1;
                    if (b.rating === undefined) return -1;
                    return Object.values(b.rating).reduce((a, b) => a + b, 0) / Object.keys(b.rating).length - Object.values(a.rating).reduce((a, b) => a + b, 0) / Object.keys(a.rating).length;
                });
                break;
            case Orders.ADDED_ASC:
                newSortedPlaces = newSortedPlaces.sort((a, b) => a.added.seconds - b.added.seconds);
                break;
            case Orders.ADDED_DESC:
                newSortedPlaces = newSortedPlaces.sort((a, b) => b.added.seconds - a.added.seconds);
                break;
            default:
                break;
        }

        const newPageNumbers = [];
        for (let i = 1; i <= Math.ceil(newSortedPlaces.length / 2); i++) { //2 place / oldal
            newPageNumbers.push(i);
        }

        setActualPlaces(newSortedPlaces.slice(0, 2)); //2 place / oldal
        setCurrentPage(1);
        setPageNumbers(newPageNumbers);
        setSortedPlaces(newSortedPlaces);
        setSortOrder(order);
    }, [placeList]);


    //Handle page change
    const handelPageChange = useCallback((pageNumber) => {
        setActualPlaces(sortedPlaces.slice((pageNumber - 1) * 2, pageNumber * 2)); //2 place / oldal

        setCurrentPage(pageNumber);
    }, [sortedPlaces]);


    //Update Places on sort order change
    useEffect(() => {
        handleSortOrderChange(sortOrder); //TODO - add filter here too as parameter
    }, [placeList, handleSortOrderChange, sortOrder]); //TODO - add filter here

    return (
        <Container className="Places">
            <h1 style={{ fontSize:"2vw", marginBottom: "5vh" }}>Helyek listája</h1>
            {errorMessage && <div>{errorMessage}</div>}
            <Row>
                <Col xs={12} lg={4} className="mb-3 text-start">
                    Ide jön majd a szűrő
                </Col>
                <Col xs={12} lg={4} className="mb-3 text-center">
                {pageNumbers.length > 1 &&
                        <Pagination className="justify-content-center">
                            {pageNumbers
                                .filter(num => num === 1 || num === pageNumbers.length || num === currentPage || num === currentPage - 1 || num === currentPage + 1)
                                .map(num => (
                                    <Pagination.Item key={num} active={num === currentPage} onClick={() => handelPageChange(num)}>
                                        {num}
                                    </Pagination.Item>
                                ))}
                        </Pagination>
                    }
                </Col>
                <Col xs={12} lg={4} className="mb-3 text-end">
                <div>
                        <Dropdown onSelect={handleSortOrderChange}>
                            <Dropdown.Toggle id="order">
                                {`sort-order-${sortOrder}`} {/* use t("sort-order-place-asc") */}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey="place-asc">{"Cím szerint A-tól Z-ig"}</Dropdown.Item>
                                <Dropdown.Item eventKey="place-desc">{"Cím szerint Z-től A-ig"}</Dropdown.Item>
                                <Dropdown.Item eventKey="rating-asc">{"Értékelés szerint növekvő"}</Dropdown.Item>
                                <Dropdown.Item eventKey="rating-desc">{"Értékelés szerint csökkenő"}</Dropdown.Item>
                                <Dropdown.Item eventKey="added-asc">{"Hozzáadás időpontja szerint növekvő"}</Dropdown.Item>
                                <Dropdown.Item eventKey="added-desc">{"Hozzáadás időpontja szerint csökkenő"}</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Col>
            </Row>
            {currentUser && <>
                {!showAddPlaceExpanded &&
                    <div
                        id="manual-entry-place"
                        className="btn btn-primary mb-3 mt-3"
                        onClick={() => setShowAddPlaceExpanded(true)}
                    >
                        Hely hozzáadása
                    </div>
                }
                <Form ref={formRef} onSubmit={onSubmitPlace}>
                    <Row style={{ display: showAddPlaceExpanded ? 'flex' : 'none' }}>
                        <Col xs={12} lg={6} className="mb-3">
                            <Form.Group controlId="address-first">
                                <Form.Label>Cím</Form.Label>
                                <AddressAutofill accessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN} onRetrieve={handleRetrieve}>
                                    <Form.Control required type="text" placeholder="Adjon meg egy címet, pl. 9026 Győr, Egyetem tér 1." name="address-first" autoComplete="address-line1" id="mapbox-autofill" />
                                </AddressAutofill>
                            </Form.Group>
                            {!showFormExpanded &&
                                <div
                                    id="manual-entry"
                                    className="btn btn-primary mb-3 mt-3"
                                    onClick={() => setShowFormExpanded(true)}
                                >
                                    Adjon meg egy címet manuálisan
                                </div>
                            }
                            <div className="secondary-inputs" style={{ display: showFormExpanded ? 'block' : 'none' }}>
                                <Form.Group controlId="address-second">
                                    <Form.Label>Cím 2. sora</Form.Label>
                                    <Form.Control type="text" placeholder="Épület, emelet, ajtó, stb." name="address-second" autoComplete="address-line2" />
                                </Form.Group>
                                <Form.Group controlId="city">
                                    <Form.Label>Település</Form.Label>
                                    <Form.Control type="text" placeholder="Település" name="city" autoComplete="address-level2" />
                                </Form.Group>
                                <Form.Group controlId="state">
                                    <Form.Label>Állam/Régió/Vármegye</Form.Label>
                                    <Form.Control type="text" placeholder="Állam/Régió/Vármegye" name="state" autoComplete="address-level1" />
                                </Form.Group>
                                <Form.Group controlId="zip">
                                    <Form.Label>Irányítószám</Form.Label>
                                    <Form.Control type="text" placeholder="Irányítószám" name="zip" autoComplete="postal-code" />
                                </Form.Group>
                            </div>
                        </Col>
                        <Col xs={12} lg={6} className="mb-3">
                            <center>
                                {/* Visual confirmation map */}
                                <div
                                    id="minimap-container"
                                    className="h240 w360 relative mt18"
                                    style={{ display: showFormExpanded ? 'block' : 'none' }}
                                >
                                    <AddressMinimap
                                        canAdjustMarker={true}
                                        satelliteToggle={true}
                                        feature={feature}
                                        show={showMinimap}
                                        onSaveMarkerLocation={handleSaveMarkerLocation}
                                        saveBtnText="Mentés"
                                        cancelBtnText="Mégse"
                                        adjustBtnText="Jelölő áthelyezése"
                                        footer="Állítsa be a jelölőt a térképen, ha nem pontosan egyezik a helyszínnel. Ez segít javítani az cím adatait."
                                    />
                                </div>
                            </center>
                        </Col>
                        <Col xs={12} lg={6} className="mb-3">
                            <Form.Group controlId="price">
                                <Form.Label>Ár</Form.Label>
                                <Form.Control type="number" placeholder="Ár" value={newPlacePrice} onChange={(e) => setNewPlacePrice(Number(e.target.value))} />
                            </Form.Group>
                        </Col>
                        <Col xs={12} lg={6} className="mb-3">
                            <Form.Group controlId="comments">
                                <Form.Label>Megjegyzés</Form.Label>
                                <Form.Control type="text" placeholder="Megjegyzés" value={newPlaceComments} onChange={(e) => setNewPlaceComments(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col xs={12} lg={6} className="mb-3">
                            <Form.Group controlId="accessible">
                                <Form.Check
                                    type="checkbox"
                                    label="Akadálymentes"
                                    checked={newPlaceAccessible}
                                    onChange={(e) => setNewPlaceAccessible(e.target.checked)}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} lg={6} className="mb-3">
                            <Form.Group controlId="public">
                                <Form.Check
                                    type="checkbox"
                                    label="Nyilvános"
                                    checked={newPlacePublic}
                                    onChange={(e) => setNewPlacePublic(e.target.checked)}
                                />
                            </Form.Group>
                        </Col>
                        {days.map((day, index) => (<>
                            <Col xs={12} lg={4} className="mb-3 d-flex justify-content-center align-items-end">
                                {day}
                            </Col>
                            <Col xs={6} lg={4} className="mb-3">
                                <Form.Group controlId={`interval-from-${index}`}>
                                    <Form.Label>-tól</Form.Label>
                                    <Form.Control type="text" placeholder="-tól" value={newPlaceOpenHours[index].intervalFrom} onChange={(e) => {
                                        const newOpenHours = [...newPlaceOpenHours];
                                        newOpenHours[index].intervalFrom = e.target.value;
                                        setNewPlaceOpenHours(newOpenHours);
                                    }} />
                                </Form.Group>
                            </Col>
                            <Col xs={6} lg={4} className="mb-3">
                                <Form.Group controlId={`interval-from-${index}`}>
                                    <Form.Label>-ig</Form.Label>
                                    <Form.Control type="text" placeholder="-ig" value={newPlaceOpenHours[index].intervalTo} onChange={(e) => {
                                        const newOpenHours = [...newPlaceOpenHours];
                                        newOpenHours[index].intervalTo = e.target.value;
                                        setNewPlaceOpenHours(newOpenHours);
                                    }} />
                                </Form.Group>
                            </Col>
                        </>))}

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
                    </Row>
                </Form>
            </>}

            {actualPlaces.map((place) =>
                <div key={place.id} style={{ marginBottom: "3rem" }}>
                    <Card border="secondary" style={{ backgroundColor: place.accepted ? "lightgreen" : "salmon", borderRadius: "2rem" }}>
                        <Card.Body>
                            <Card.Title>{place.city}, {place.address}</Card.Title>
                            <Card.Subtitle style={{ marginBottom: "1rem" }}>{place.comments}</Card.Subtitle>
                            <Card.Text as="div">
                                {place.public ? "Publikus " : "Privát "}    {/*A hely publikus vagy privát*/}
                                <ul>
                                    {place.opening_times.map((time, index) => {

                                        return <li key={index}>{`${days[index]}: ${time}`}</li>;    //A nyitvatartási idők megjelenítése listában

                                    })}
                                </ul>
                                <br />
                                {
                                    place.rating === undefined
                                        ? "Nincs értékelés"
                                        : (Object.values(place.rating).reduce((a, b) => a + b, 0) / Object.keys(place.rating).length).toFixed(2) //Az értékelések átlaga 2 tizedesjegy pontossággal
                                }
                            </Card.Text>

                            {currentUser && currentUser.uid === adminUser && (  //Csak az admin tudja törölni és elfogadni a helyeket
                                <>
                                    <Button onClick={() => deletePlace(place.id)}>Hely törlése</Button>
                                    {place.accepted ? "" : <Button onClick={() => acceptPlace(place.id)}>Hely elfogadása</Button>}  {/*Ha a hely nincs elfogadva, akkor megjelenik az elfogadás gomb*/}

                                </>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            )}
        </Container>
    );
}
