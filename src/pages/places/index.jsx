import { useEffect, useState, useCallback, useContext, Fragment, useRef } from "react";
import { db, adminUser } from "../../config/firebase";
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Button, Card, Container, Row, Col, Form, Dropdown, Pagination, Tabs, Tab } from "react-bootstrap";
import { AddressAutofill, AddressMinimap, useConfirmAddress, config } from '@mapbox/search-js-react';
import AuthContext from "../../contexts/logoutcontext";
import { downloadPlaces } from '../../components/fbtojson';
import Filters from "../../components/filters";
import { useTranslation } from 'react-i18next';
import Review from "../../components/review";
import ShowReviews from "../../components/showreviews";
import { Map as MapBoxMap, Marker } from 'react-map-gl';

export const useDays = () => {
    const { t } = useTranslation();
    return [t('days.monday'), t('days.tuesday'), t('days.wednesday'), t('days.thursday'), t('days.friday'), t('days.saturday'), t('days.sunday')];
};
const Orders = {
    PLACE_ASC: "place-asc",
    PLACE_DESC: "place-desc",
    RATING_ASC: "rating-asc",
    RATING_DESC: "rating-desc",
    ADDED_ASC: "added-asc",
    ADDED_DESC: "added-desc",
}


export function Places() {
    const { t } = useTranslation();
    const days = useDays();
    const { currentUser } = useContext(AuthContext);

    const [placeList, setPlaceList] = useState([]);

    const [addedTodayCount, setAddedTodayCount] = useState(0);

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


    const [key, setKey] = useState('place');

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

        setAddedTodayCount(placeList.filter(
            (place) =>
                place.added.seconds > (Date.now() / 1000 - 24 * 60 * 60) &&
                place.added_by === currentUser.uid
        ).length);
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
        let existingPlace;
        if (key === "place") {
            existingPlace = placeList.find(
                (place) =>
                    place.city.toLowerCase() === feature.properties.place.toLowerCase() &&
                    place.address.toLowerCase() === (feature.properties.address_line1 + (feature.properties.address_line2 ? " " + feature.properties.address_line2 : "")).toLowerCase()
            );
        } else {
            existingPlace = placeList.find(
                (place) =>
                    place.city.toLowerCase() === manualAddress.place.toLowerCase() &&
                    place.address.toLowerCase() === (manualAddress.address_line1 + (manualAddress.address_line2 ? " " + manualAddress.address_line2 : "")).toLowerCase()
            );
        }

        const addedTodayAlready = adminUser !== currentUser.uid && addedTodayCount >= 5;

        if (existingPlace) {
            setErrorMessage("A hely már létezik vagy elfogadásra vár.");
        } else if (addedTodayAlready) {
            setErrorMessage("Már adott hozzá 5 helyet az elmúlt 24 órában.");
        } else {
            setErrorMessage(null);
            try {
                console.log(key);
                if (key === "place") {
                await addDoc(placeCollectionRef,
                    {
                        country: feature.properties.country,
                        city: feature.properties.place,
                        address: feature.properties.address_line1 + (feature.properties.address_line2 ? " " + feature.properties.address_line2 : ""),
                        price: Number(newPlacePrice),
                        comments: newPlaceComments,
                        accessible: newPlaceAccessible,
                        accepted: newPlaceAccepted || currentUser.uid === adminUser,
                        latitude: feature.geometry.coordinates[1],
                        longitude: feature.geometry.coordinates[0],
                        opening_times: newPlaceOpenHours.map((day) => `${day.intervalFrom}-${day.intervalTo}`),
                        public: newPlacePublic,
                        added: serverTimestamp(),
                        added_by: currentUser.uid,

                    });
                } else {
                    await addDoc(placeCollectionRef,
                        {
                            country: manualAddress.country,
                            city: manualAddress.place,
                            address: manualAddress.address_line1 + (manualAddress.address_line2 ? " " + manualAddress.address_line2 : ""),
                            price: Number(newPlacePrice),
                            comments: newPlaceComments,
                            accessible: newPlaceAccessible,
                            accepted: newPlaceAccepted || currentUser.uid === adminUser,
                            latitude: manualCoordinates.latitude,
                            longitude: manualCoordinates.longitude,
                            opening_times: newPlaceOpenHours.map((day) => `${day.intervalFrom}-${day.intervalTo}`),
                            public: newPlacePublic,
                            added: serverTimestamp(),
                            added_by: currentUser.uid,
                        });
                    }


                getPlaceList(); // A lista frissítése

                // Reset form
                resetForm();
            }
            catch (err) {
                console.error(err);
            }
        }

    };

    function resetForm() {
        const inputs = document.querySelectorAll("input");
        inputs.forEach(input => input.value = "");

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
        setShowAddPlaceExpanded(false);
        setFeature(null);
        setShowMinimap(false);
        setManualAddress({
            address_line1: "",
            address_line2: "",
            place: "",
            county: "",
            postcode: "",
            country: "",
        });
        setManualCoordinates({
            latitude: null,
            longitude: null,
        });
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



    const [filterFunction, setFilterFunction] = useState(() => (place) => true);

    //Sorting and pagination
    const [sortOrder, setSortOrder] = useState(Orders.ADDED_ASC);     //Rendezés sorrendje
    const [sortedPlaces, setSortedPlaces] = useState([]);   //Rendezett teljes lista
    const [pageNumbers, setPageNumbers] = useState([1]);    //Oldalszámok listája
    const [currentPage, setCurrentPage] = useState(1);      //Aktuális oldal sorszáma
    const [actualPlaces, setActualPlaces] = useState([]);   //Aktuális oldalon megjelenő elemek


    //Handle sorting order change
    const handleSortOrderChange = useCallback((order) => {
        let newSortedPlaces = [...placeList].filter((place) => place.accepted || (currentUser && currentUser.uid === adminUser)).filter(filterFunction); //TODO extend with filter

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
        for (let i = 1; i <= Math.ceil(newSortedPlaces.length / 10); i++) { //2 place / oldal
            newPageNumbers.push(i);
        }

        setActualPlaces(newSortedPlaces.slice(0, 10)); //2 place / oldal
        setCurrentPage(1);
        setPageNumbers(newPageNumbers);
        setSortedPlaces(newSortedPlaces);
        setSortOrder(order);
    }, [placeList, filterFunction, currentUser]);


    //Handle page change
    const handelPageChange = useCallback((pageNumber) => {
        setActualPlaces(sortedPlaces.slice((pageNumber - 1) * 10, pageNumber * 10)); //2 place / oldal

        setCurrentPage(pageNumber);
    }, [sortedPlaces]);


    //Update Places on sort order change
    useEffect(() => {
        handleSortOrderChange(sortOrder);
    }, [placeList, handleSortOrderChange, sortOrder]);

    
    const mapRef = useRef();
    const [manualAddress, setManualAddress] = useState({
        address_line1: "",
        address_line2: "",
        place: "",
        county: "",
        postcode: "",
        country: "",
    });
    const [manualCoordinates, setManualCoordinates] = useState({
        latitude: null,
        longitude: null,
    });
    console.log(manualAddress);

    const getAddress = async (longitude, latitude) => {
        const query = await fetch(
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&types=address,street&access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`,
            { method: 'GET' }
        );
        const json = await query.json();
        console.log(json);

        if (json.features.length > 0) {
            const addressFeature = json.features.find((feature) => feature.properties.feature_type === "address");
            const feature = addressFeature || json.features.find((feature) => feature.properties.feature_type === "street");

            const context = feature.properties.context;

            const country = context.country.name;
            const county = context.region.name;
            const place = context.place.name;
            const street = feature.properties.name;
            const postcode = context.postcode.name;

            setManualAddress({
                address_line1: street,
                address_line2: "",
                place: place,
                county: county,
                postcode: postcode,
                country: country,
            });
        }
    };
    useEffect(() => {
        if (manualCoordinates.latitude && manualCoordinates.longitude) {
            getAddress(manualCoordinates.longitude, manualCoordinates.latitude);
        }
    }, [manualCoordinates]);

    return (
        <Container className="Places">
            <h1 style={{ marginBottom: "5vh" }}>{t('places.title')}</h1>
            <Row>
                <Col xs={12} lg={5} className="mb-3 text-start" >
                    <Container fluid="xs">
                        <Filters setFilterFunction={setFilterFunction} />
                    </Container>
                </Col>
                <Col xs={12} lg={2} className="mb-3 text-center">
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
                <Col xs={12} lg={5} className="mb-3 text-end">
                    <div>
                        <Dropdown onSelect={handleSortOrderChange}>
                            <Dropdown.Toggle id="order">
                                {t(`places.sort.${sortOrder}`)}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey="place-asc">{t('places.sort.places-asc')}</Dropdown.Item>
                                <Dropdown.Item eventKey="place-desc">{t('places.sort.places-desc')}</Dropdown.Item>
                                <Dropdown.Item eventKey="rating-asc">{t('places.sort.rating-asc')}</Dropdown.Item>
                                <Dropdown.Item eventKey="rating-desc">{t('places.sort.rating-desc')}</Dropdown.Item>
                                <Dropdown.Item eventKey="added-asc">{t('places.sort.added-asc')}</Dropdown.Item>
                                <Dropdown.Item eventKey="added-desc">{t('places.sort.added-desc')}</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Col>
            </Row>
            {currentUser && (addedTodayCount <= 5 || adminUser === currentUser.uid) && <>
                {!showAddPlaceExpanded &&
                    <div
                        id="manual-entry-place"
                        className="btn btn-primary mb-3 mt-3"
                        onClick={() => setShowAddPlaceExpanded(true)}
                    >
                        {t('places.add.addplace')}
                    </div>
                }
                <Form ref={formRef} onSubmit={onSubmitPlace} style={{ display: showAddPlaceExpanded ? 'block' : 'none' }}>
                    <Tabs activeKey={key} onSelect={(e) => setKey(e)} id="place-tab" className="mb-3" fill justify style={{ paddingRight: "0px" }}>
                        <Tab eventKey="place" title={"Gépi"}>
                            <Row>
                                <Col xs={12} lg={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>{t('places.add.address')}</Form.Label>
                                        <AddressAutofill accessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN} onRetrieve={handleRetrieve}>
                                            <Form.Control type="text" placeholder={t('places.add.addresspaceholder')} name="address-first" autoComplete="address-line1" id="mapbox-autofill" onChange={(e) => {
                                                if (feature) {
                                                    //set value to feauture
                                                    setFeature((prev) => ({
                                                        ...prev,
                                                        properties: {
                                                            ...prev.properties,
                                                            address_line1: e.target.value
                                                        }
                                                    }));
                                                }
                                            }} />
                                        </AddressAutofill>
                                    </Form.Group>
                                    {!showFormExpanded &&
                                        <Button
                                            variant="secondary"
                                            id="manual-entry"
                                            className="mb-3 mt-3"
                                            onClick={() => setShowFormExpanded(true)}
                                        >
                                            {t('places.add.manualentry')}
                                        </Button>
                                    }
                                    <div className="secondary-inputs" style={{ display: showFormExpanded ? 'block' : 'none' }}>
                                        <Form.Group controlId="address-second">
                                            <Form.Label>{t('places.add.address-second')}</Form.Label>
                                            <Form.Control type="text" placeholder={t('places.add.address-secondpaceholder')} name="address-second" autoComplete="address-line2" onChange={(e) => {
                                                if (feature) {
                                                    //set value to feauture
                                                    setFeature((prev) => ({
                                                        ...prev,
                                                        properties: {
                                                            ...prev.properties,
                                                            address_line2: e.target.value
                                                        }
                                                    }));
                                                }
                                            }} />
                                        </Form.Group>
                                        <Form.Group controlId="city">
                                            <Form.Label>{t('places.add.city')}</Form.Label>
                                            <Form.Control type="text" placeholder={t('places.add.citypaceholder')} name="city" autoComplete="address-level2" onChange={(e) => {
                                                if (feature) {
                                                    //set value to feauture
                                                    setFeature((prev) => ({
                                                        ...prev,
                                                        properties: {
                                                            ...prev.properties,
                                                            place: e.target.value
                                                        }
                                                    }));
                                                }
                                            }} />
                                        </Form.Group>
                                        <Form.Group controlId="state">
                                            <Form.Label>{t('places.add.county')}</Form.Label>
                                            <Form.Control type="text" placeholder={t('places.add.countypaceholder')} name="state" autoComplete="address-level1" />
                                        </Form.Group>
                                        <Form.Group controlId="zip">
                                            <Form.Label>{t('places.add.postalcode')}</Form.Label>
                                            <Form.Control type="text" placeholder={t('places.add.postalcodepaceholder')} name="zip" autoComplete="postal-code" />
                                        </Form.Group>
                                    </div>
                                </Col>
                                <Col xs={12} lg={6} className="mb-3">
                                    <div style={{ position: 'relative', display: showFormExpanded ? 'block' : 'none' }}>
                                        <center style={{ zIndex: 1, display: showFormExpanded ? 'block' : 'none' }}>
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
                                                    saveBtnText={t('places.add.savemarker')}
                                                    cancelBtnText={t('places.add.cancelmarker')}
                                                    adjustBtnText={t('places.add.adjustmarker')}
                                                    footer={t('places.add.mapfooter')}
                                                />
                                            </div>
                                        </center>
                                    </div>
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey="manual" title={"Kézi"}>
                            <Row>
                                <Col xs={12} lg={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>{t('places.add.address')}</Form.Label>
                                        <Form.Control required type="text" placeholder={t('places.add.addresspaceholder')} name="address-first" value={manualAddress.address_line1} onChange={(e) => { setManualAddress({ ...manualAddress, address_line1: e.target.value }) }} />
                                    </Form.Group>
                                    <Form.Group controlId="address-second">
                                        <Form.Label>{t('places.add.address-second')}</Form.Label>
                                        <Form.Control type="text" placeholder={t('places.add.address-secondpaceholder')} name="address-second" value={manualAddress.address_line2} onChange={(e) => { setManualAddress({ ...manualAddress, address_line2: e.target.value }) }} />
                                    </Form.Group>
                                    <Form.Group controlId="city">
                                        <Form.Label>{t('places.add.city')}</Form.Label>
                                        <Form.Control type="text" placeholder={t('places.add.citypaceholder')} name="city" value={manualAddress.place} onChange={(e) => { setManualAddress({ ...manualAddress, place: e.target.value }) }} />
                                    </Form.Group>
                                    <Form.Group controlId="state">
                                        <Form.Label>{t('places.add.county')}</Form.Label>
                                        <Form.Control type="text" placeholder={t('places.add.countypaceholder')} name="state" value={manualAddress.county} onChange={(e) => { setManualAddress({ ...manualAddress, county: e.target.value }) }} />
                                    </Form.Group>
                                    <Form.Group controlId="zip">
                                        <Form.Label>{t('places.add.postalcode')}</Form.Label>
                                        <Form.Control type="text" placeholder={t('places.add.postalcodepaceholder')} name="zip" value={manualAddress.postcode} onChange={(e) => { setManualAddress({ ...manualAddress, postcode: e.target.value }) }} />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} lg={6} className="mb-3">
                                    <div style={{ position: 'relative'}}>
                                        <center style={{ zIndex: 1 }}>
                                            {/* Visual confirmation map */}
                                            <div
                                                id="minimap-container"
                                                className="relative mt18"
                                            >
                                                <MapBoxMap
                                                    ref={mapRef}
                                                    mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                                                    mapStyle="mapbox://styles/mapbox/streets-v11"
                                                    style={{ width: "100%", aspectRatio: "2" }}
                                                    initialViewState={{
                                                        longitude: 19.504001543678186,
                                                        latitude: 47.18010736034033,
                                                        zoom: 7,
                                                    }}
                                                    onClick={(e) => {
                                                        setManualCoordinates({
                                                            latitude: e.lngLat.lat,
                                                            longitude: e.lngLat.lng
                                                        });
                                                    }}
                                                    >
                                                    {manualCoordinates.latitude && manualCoordinates.longitude && <Marker latitude={manualCoordinates.latitude} longitude={manualCoordinates.longitude} />}
                                                </MapBoxMap>
                                                <p>
                                                    {manualCoordinates.latitude}
                                                    <br />
                                                    {manualCoordinates.longitude}
                                                </p>
                                            </div>
                                        </center>
                                    </div>
                                </Col>
                            </Row>
                        </Tab>
                    </Tabs>
                    <hr/>
                        
                    <Row>
                        <Col xs={12} lg={6} className="mb-3">
                            <Form.Group controlId="price">
                                <Form.Label>{t('places.add.price')}</Form.Label>
                                <Form.Control type="number" placeholder={t('places.add.pricepaceholder')} value={newPlacePrice} onChange={(e) => setNewPlacePrice(Number(e.target.value))} />
                            </Form.Group>
                        </Col>
                        <Col xs={12} lg={6} className="mb-3">
                            <Form.Group controlId="comments">
                                <Form.Label>{t('places.add.comments')}</Form.Label>
                                <Form.Control type="text" placeholder={t('places.add.commentspaceholder')} value={newPlaceComments} onChange={(e) => setNewPlaceComments(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col xs={12} lg={6} className="mb-3 text-start">
                            <Form.Group controlId="accessible">
                                <Form.Check
                                    type="checkbox"
                                    label={t('places.add.accessible')}
                                    checked={newPlaceAccessible}
                                    onChange={(e) => setNewPlaceAccessible(e.target.checked)}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} lg={6} className="mb-3 text-start">
                            <Form.Group controlId="public">
                                <Form.Check
                                    type="checkbox"
                                    label={t('places.add.public')}
                                    checked={newPlacePublic}
                                    onChange={(e) => setNewPlacePublic(e.target.checked)}
                                />
                            </Form.Group>
                        </Col>
                        <hr/>
                        <Col xs={12} className="mb-2 p-3">
                            {t('map.openhours')}
                        </Col>
                        {days.map((day, index) => (
                            <Fragment key={index}>
                                <Col xs={12} lg={4} className="mb-3 d-flex justify-content-center align-items-end">
                                {day}
                                </Col>
                                <Col xs={6} lg={4} className="mb-3">
                                <Form.Group controlId={`interval-from-${index}`}>
                                    <Form.Control type="text" placeholder={t('places.add.from')} value={newPlaceOpenHours[index].intervalFrom} onChange={(e) => {
                                    const newOpenHours = [...newPlaceOpenHours];
                                    newOpenHours[index].intervalFrom = e.target.value;
                                    setNewPlaceOpenHours(newOpenHours);
                                    }} />
                                </Form.Group>
                                </Col>
                                <Col xs={6} lg={4} className="mb-3">
                                <Form.Group controlId={`interval-to-${index}`}>
                                    <Form.Control type="text" placeholder={t('places.add.to')} value={newPlaceOpenHours[index].intervalTo} onChange={(e) => {
                                    const newOpenHours = [...newPlaceOpenHours];
                                    newOpenHours[index].intervalTo = e.target.value;
                                    setNewPlaceOpenHours(newOpenHours);
                                    }} />
                                </Form.Group>
                                </Col>
                            </Fragment>
                            ))}
                        <Col xs={12} className="mt-2 mb-3" />
                        <hr/>

                        {/* Form buttons */}
                        {(showFormExpanded || (key === "manual" && manualCoordinates.latitude !== null && manualCoordinates.longitude !== null)) &&
                            <div className="mb-3 d-flex justify-content-center align-items-end">
                                {errorMessage && <div>{errorMessage}</div>}
                                <Button variant="primary" type="submit" className="me-2">
                                    {t('places.add.submit')}
                                </Button>
                                <Button variant="secondary" type="button" className="ms-2" onClick={resetForm}>
                                    {t('places.add.reset')}
                                </Button>
                            </div>
                        }
                    </Row>
                </Form>
            </>}

            {actualPlaces.map((place) =>
                <Card key={place.id} border="secondary" style={{ marginBottom: "3rem", backgroundColor: place.accepted ? "lightgreen" : "salmon", borderRadius: "2rem" }}>
                    <Card.Body>
                        <Card.Title>{place.city}, {place.address}</Card.Title>
                        <Card.Subtitle style={{ marginBottom: "1rem" }}>{place.comments}</Card.Subtitle>
                        <Card.Text as="div">
                            {place.public ? t('map.public') : t('map.private')}
                            <br />
                            <br />    {/*A hely publikus vagy privát*/}
                            {t('map.openhours')}<br /> {/*A nyitvatartási idők*/}

                            {place.opening_times.map((time, index) => {
                                return <Fragment key={index}>{`${days[index]}: ${time}`}<br /></Fragment>;    //A nyitvatartási idők megjelenítése listában
                            })}
                            <br />
                            {
                                place.rating_calculated === -1
                                    ? t('map.norating')
                                    : <>{t('map.rating')} {(place.rating_calculated).toFixed(2)}</> //Az értékelések átlaga 2 tizedesjegy pontossággal
                            }
                            <br />
                            <br />
                            {currentUser && <Review place={place} triggerUpdate={getPlaceList} />} {/*A hely értékelése*/}
                            <ShowReviews place={place} triggerUpdate={getPlaceList} />
                        </Card.Text>
                        {currentUser && currentUser.uid === adminUser && (  //Csak az admin tudja törölni és elfogadni a helyeket
                            <>
                                <Button variant="warning" href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`} target="_blank">{t('places.openmap')}</Button> {/*A hely megnyitása a Google Maps-en*/}
                                <Button variant="danger" onClick={() => deletePlace(place.id)}>{t('places.delete')}</Button>
                                {!place.accepted && <Button variant="success" onClick={() => acceptPlace(place.id)} className="ms-2">{t('places.accept')}</Button>}  {/*Ha a hely nincs elfogadva, akkor megjelenik az elfogadás gomb*/}

                            </>
                        )}
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
}
