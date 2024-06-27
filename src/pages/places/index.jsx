import { useEffect, useState, useCallback, useContext, Fragment, useRef } from "react";
import { db, adminUser } from "../../config/firebase";
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Alert, Button, Card, Container, Row, Col, Form, Dropdown, Pagination, Tabs, Tab } from "react-bootstrap";
import { AddressAutofill, AddressMinimap, useConfirmAddress, config } from '@mapbox/search-js-react';
import AuthContext from "../../contexts/logoutcontext";
import { downloadPlaces } from '../../components/fbtojson';
import Filters from "../../components/filters";
import { useTranslation } from 'react-i18next';
import Review from "../../components/review";
import ShowReviews from "../../components/showreviews";
import { Map as MapBoxMap, Marker } from 'react-map-gl';
import { currencyByCountry } from "../../components/currency";

export const useDays = () => {
    const { t } = useTranslation();
    useEffect(() => { document.title = t('nav.places') + " | " + t('nav.main'); })
    return [t('days.monday'), t('days.tuesday'), t('days.wednesday'), t('days.thursday'), t('days.friday'), t('days.saturday'), t('days.sunday')];
};
const Orders = {
    PLACE_ASC: "place-asc",
    PLACE_DESC: "place-desc",
    RATING_ASC: "rating-asc",
    RATING_DESC: "rating-desc",
    ADDED_ASC: "added-asc",
    ADDED_DESC: "added-desc",
};

export function Places() {
    const { t } = useTranslation();

    const days = useDays();

    const { currentUser } = useContext(AuthContext);

    const [placeList, setPlaceList] = useState([]);

    const [addedTodayCount, setAddedTodayCount] = useState(0);

    const [errorMessage, setErrorMessage] = useState(null);

    const [lastUpdated, setLastUpdated] = useState(null);

    // New Place States

    const [newPlacePrice, setNewPlacePrice] = useState("")
    const [newPlaceComments, setNewPlaceComments] = useState("");
    const [newPlaceAccessible, setNewPlaceAccessible] = useState(false);
    const [newPlaceAccepted, setNewPlaceAccepted] = useState(false);
    const [newPlacePublic, setNewPlacePublic] = useState(false);

    // Update Place States

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
                place.added.seconds > (Date.now() / 1000 - 24 * 60 * 60) && // 24 órán belül hozzáadott helyek
                place.added_by === currentUser.uid
        ).length);
    }, [])

    const { formRef } = useConfirmAddress({
        minimap: true,
        skipConfirmModal: (feature) => {
            ['exact', 'high'].includes(feature.properties.match_code.confidence)    //Ha a cím megbízhatósága magas, akkor nem jön fel a megerősítő ablak
        }
    });

    const handleRetrieve = useCallback( //A térképes kiválasztás után a hely kiválasztása
        (res) => {
            const feature = res.features[0];
            setFeature(feature);
            setShowMinimap(true);
            setShowFormExpanded(true);
        },
        [setFeature, setShowMinimap]
    );

    function handleSaveMarkerLocation(coordinate) { //Minimapon kiválasztott hely mentése
        setFeature((prev) => ({
            ...prev,
            geometry: {
                ...prev.geometry,
                coordinates: [coordinate[0], coordinate[1]]
            }
        }));
    }

    const [alertMessage, setAlertMessage] = useState(null);

    useEffect(() => {
        if (errorMessage) {
            const timeout = setTimeout(() => {
                setErrorMessage(null);
            }, 10000);  // 10 másodperc után eltűnik az error message
            return () => clearTimeout(timeout);
        }
    }, [errorMessage]);

    useEffect(() => {
        if (alertMessage) {
            const timeout = setTimeout(() => {
                setAlertMessage(null);
            }, 5000);  // 5 másodperc után eltűnik az alert message
            return () => clearTimeout(timeout);
        }
    }, [alertMessage]);

    const onSubmitPlace = async (e) => {
        e.preventDefault();
        let existingPlace;  // Ha true, akkor már van ilyen hely a listában
        if (key === "place") {
            existingPlace = placeList.find(
                (place) =>
                    place.city.toLowerCase() === feature.properties.place.toLowerCase() &&
                    place.address.toLowerCase() === (feature.properties.address_line1 + (feature.properties.address_line2 ? " " + feature.properties.address_line2 : "")).toLowerCase() &&
                    place.comments.toLowerCase() === newPlaceComments.toLowerCase()     //Kommentet megnézi, hogy az egyezik-e
            );
        } else {
            existingPlace = placeList.find(
                (place) =>
                    place.city.toLowerCase() === manualAddress.place.toLowerCase() &&
                    place.address.toLowerCase() === (manualAddress.address_line1 + (manualAddress.address_line2 ? " " + manualAddress.address_line2 : "")).toLowerCase() &&
                    place.comments.toLowerCase() === newPlaceComments.toLowerCase()    //Kommentet megnézi, hogy az egyezik-e
            );
        }

        const addedTodayAlready = adminUser !== currentUser.uid && addedTodayCount >= 5;

        const validateForm = () => {    //Ha csak az egyik időpontot adta meg az egyik napra, akkor false
            let isNotEmpty = true;
            newPlaceOpenHours.forEach(hour => {
                if ((hour.intervalFrom === "" && hour.intervalTo !== "") || (hour.intervalFrom !== "" && hour.intervalTo === "")) {
                    isNotEmpty = false;
                }
            });
            return isNotEmpty;
        };
        const validateTime = () => {    //Ha a nyitás ugyanakkor vagy később van, mint a nyitás, akkor false
            let isValidTime = true;
            for (let i = 0; i < newPlaceOpenHours.length; i++) {
                const openingTime = newPlaceOpenHours[i].intervalFrom;
                const closingTime = newPlaceOpenHours[i].intervalTo;
                if (closingTime <= openingTime && closingTime !== "" && openingTime !== "") {
                    isValidTime = false;
                }
            }
            return isValidTime;
        };

        if (existingPlace) {
            setErrorMessage('error.duplicate'); //Ha már létezik a hely, akkor errort dob
        } else if (addedTodayAlready) {
            setErrorMessage('error.limit'); //Ha már 5 helyet hozzáadott a felhasználó 24 órán belül, akkor errort dob
        } else {
            const isValidForm = validateForm();
            // if ((manualAddress.address_line1 === "" || manualAddress.place === "") && (feature.properties.address_line1 === "" || feature.properties.place === "")){
            //     setErrorMessage('error.selectplace');   //Ha térképes kiválasztásnál nem jött cím vissza, akkor errort dob
            // } else if
            if (isValidForm === false) {
                setErrorMessage('error.fillout');   //Ha csak az egyik időpontot adta meg az egyik napra, akkor errort dob
            } else {
                const isValidTime = validateTime();
                if (isValidTime === false) {
                    setErrorMessage('error.invalidtime');   //Ha a nyitás ugyanakkor vagy később van, mint a zárás, akkor errort dob
                } else {
                    setErrorMessage(null);
                    try {
                        if (key === "place") {
                            await addDoc(placeCollectionRef,
                                {
                                    country: feature.properties.country,    //Ország
                                    city: feature.properties.place, //Város
                                    address: feature.properties.address_line1 + (feature.properties.address_line2 ? " " + feature.properties.address_line2 : ""),   //Cím (cím1 + cím2)
                                    price: Number(newPlacePrice),   //Használati díj
                                    comments: newPlaceComments, //Megjegyzés
                                    accessible: newPlaceAccessible, //Akadálymentes-e
                                    accepted: newPlaceAccepted || currentUser.uid === adminUser,    //Elfogadva-e
                                    latitude: feature.geometry.coordinates[1],  //Földrajzi szélesség
                                    longitude: feature.geometry.coordinates[0], //Földrajzi hosszúság
                                    opening_times: newPlaceOpenHours.map((day) => `${day.intervalFrom}-${day.intervalTo}`), //Nyitvatartás (naponként, intervallumokkal)
                                    public: newPlacePublic, //Nyilvános-e
                                    added: serverTimestamp(),   //Hozzáadás dátuma
                                    added_by: currentUser.uid,  //Hozzáadó felhasználó

                                });
                        } else {
                            await addDoc(placeCollectionRef,    //Ugyanaz, mint előbb, csak a manuális hozzáadásnál
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
                        setAlertMessage("places.add.addedplace");

                        // Reset form
                        resetForm();
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            }
        };
    }

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


    const [filterFunction, setFilterFunction] = useState(() => (place) => true);


    //Rendezés és pagination
    const [sortOrder, setSortOrder] = useState(Orders.ADDED_DESC);     //Rendezés sorrendje
    const [sortedPlaces, setSortedPlaces] = useState([]);   //Rendezett teljes lista
    const [pageNumbers, setPageNumbers] = useState([1]);    //Oldalszámok listája
    const [currentPage, setCurrentPage] = useState(1);      //Aktuális oldal sorszáma
    const [actualPlaces, setActualPlaces] = useState([]);   //Aktuális oldalon megjelenő elemek


    //Rendezési sorrend változtatásának kezelése
    const handleSortOrderChange = useCallback((order) => {
        let newSortedPlaces = [...placeList].filter((place) => place.accepted || (currentUser && currentUser.uid === adminUser)).filter(filterFunction);

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
        for (let i = 1; i <= Math.ceil(newSortedPlaces.length / 10); i++) { //10 place / oldal
            newPageNumbers.push(i);
        }

        setActualPlaces(newSortedPlaces.slice(0, 10)); //10 place / oldal
        setCurrentPage(1);
        setPageNumbers(newPageNumbers);
        setSortedPlaces(newSortedPlaces);
        setSortOrder(order);
    }, [placeList, filterFunction, currentUser]);


    //Oldal váltás kezelése
    const handelPageChange = useCallback((pageNumber) => {
        setActualPlaces(sortedPlaces.slice((pageNumber - 1) * 10, pageNumber * 10)); //2 place / oldal

        setCurrentPage(pageNumber);
    }, [sortedPlaces]);


    //Helyek frissítése a rendezési sorrend változásakor
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

    const getAddress = async (longitude, latitude) => { //Koordináták alapján cím lekérdezése (mapbox GeoCoding API)
        const query = await fetch(
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&types=address,street&access_token=${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`,
            { method: 'GET' }
        );
        const json = await query.json();

        if (json.features.length > 0) { //Ha van viszontválasz
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
        if (manualCoordinates.latitude && manualCoordinates.longitude) {    //Ha megvannak a koordináták, akkor lekérdezi a címet
            getAddress(manualCoordinates.longitude, manualCoordinates.latitude);
        }
    }, [manualCoordinates]);    //Mindig, ha a koordináták változnak

    useEffect(() => {
        setLastUpdated('manualAddress');
    }, [manualAddress]);

    useEffect(() => {
        if (feature && feature.properties) {
            setLastUpdated('feature');
        }
    }, [feature?.properties]);

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
            <Row>
                {alertMessage && <Alert variant="success">{t(alertMessage)}</Alert>}
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
                    <Tabs activeKey={key}
                        onSelect={(selectedKey) => {
                            setKey(selectedKey);
                            if (selectedKey === 'manual') {
                                setTimeout(() => {
                                    const map = mapRef.current.getMap();
                                    map.resize();
                                }, 0);
                            }
                        }}
                        id="place-tab"
                        className="mb-3"
                        fill justify
                        style={{ paddingRight: "0px" }}>
                        <Tab eventKey="place" title={t('places.add.byaddress')}>
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
                                            {t('places.add.detailedentry')}
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
                        <Tab eventKey="manual" title={t('places.add.bymanual')}>
                            <Row>
                                <Col xs={12} lg={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>{t('places.add.address')}</Form.Label>
                                        <Form.Control type="text" placeholder={t('places.add.addresspaceholder')} name="address-first" value={manualAddress.address_line1} onChange={(e) => { setManualAddress({ ...manualAddress, address_line1: e.target.value }) }} />
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
                                <Col xs={12} lg={6} className="mb-3" id='kol'>
                                    <div style={{ position: 'relative' }} id="kulsodiv">
                                        <center style={{ zIndex: 1 }} id="cen">
                                            {/* Visual confirmation map */}
                                            <div
                                                id="minimap-container"
                                                className="relative mt18"
                                            >
                                                <MapBoxMap
                                                    ref={mapRef}
                                                    mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                                                    mapStyle="mapbox://styles/mapbox/streets-v11"
                                                    id="terkep"
                                                    style={{ width: "100%", aspectRatio: "1.85" }}
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
                    <hr />

                    <Row>
                        <Col xs={12} lg={6} className="mb-3">
                            <Form.Group controlId="price">
                                <Form.Label>{t('places.add.price')}</Form.Label>
                                <Form.Control type="number" min="0" step="0.01"
                                    placeholder={
                                        lastUpdated === 'manualAddress'
                                            ? currencyByCountry(manualAddress.country, t)
                                            : lastUpdated === 'feature'
                                                ? currencyByCountry(feature.properties.country, t)
                                                : ""
                                    }
                                    value={newPlacePrice} onChange={(e) => setNewPlacePrice(Number(e.target.value))}/>
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
                        <hr />
                        <Col xs={12} className="mb-2 p-3">
                            {t('map.openhours')}
                        </Col>
                        {days.map((day, index) => (
                            <Fragment key={index}>
                                <Col xs={12} lg={4} className="mb-3 d-flex justify-content-center align-items-end">
                                    {day}
                                </Col>
                                <Col xs={6} lg={4} className="mb-3">
                                {index === 0 && t('places.add.from')}
                                    <Form.Group controlId={`interval-from-${index}`}>
                                        <Form.Control
                                            type="time"
                                            placeholder={t('places.add.from')}
                                            value={newPlaceOpenHours[index].intervalFrom}
                                            onChange={(e) => {
                                                const newOpenHours = [...newPlaceOpenHours];
                                                newOpenHours[index].intervalFrom = e.target.value;  //Csak számok és kettőspont lehet
                                                setNewPlaceOpenHours(newOpenHours);
                                            }}

                                        /> 
                                    </Form.Group>
                                </Col>
                                <Col xs={6} lg={4} className="mb-3">
                                {index === 0 && t('places.add.to')}
                                    <Form.Group controlId={`interval-to-${index}`}>
                                        <Form.Control
                                            type="time"
                                            placeholder={t('places.add.to')}
                                            value={newPlaceOpenHours[index].intervalTo}
                                            onChange={(e) => {
                                                const newOpenHours = [...newPlaceOpenHours];
                                                newOpenHours[index].intervalTo = e.target.value;
                                                setNewPlaceOpenHours(newOpenHours);
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Fragment>
                        ))}
                        <Col xs={12} className="mt-2 mb-3" />
                        <hr />

                        {/* Form buttons */}
                        {(showFormExpanded || (key === "manual" && manualCoordinates.latitude !== null && manualCoordinates.longitude !== null)) &&
                            <div className="mb-3 d-flex flex-column align-items-center">
                                <div className="w-100">
                                    {errorMessage && <Alert variant="danger" dismissible>{t(errorMessage)}</Alert>}
                                </div>
                                <div className="d-flex justify-content-center align-items-end">
                                    <Button variant="primary" type="submit" className="me-2">
                                        {t('places.add.submit')}
                                    </Button>
                                    <Button variant="secondary" type="button" className="ms-2" onClick={resetForm}>
                                        {t('places.add.reset')}
                                    </Button>
                                </div>
                            </div>
                        }
                    </Row>
                </Form>
            </>}

            {actualPlaces.map((place) =>
                <Card key={place.id} border="secondary" style={{ marginBottom: "3rem", backgroundColor: place.accepted ? "lightgreen" : "salmon", borderRadius: "2rem" }}>
                    <Card.Body>
                        <Card.Title>{place.city}, {place.address}</Card.Title>
                        <Card.Subtitle style={{ marginBottom: "1rem" }}>{place.comments ? `(${place.comments})` : ""}</Card.Subtitle>
                        <Card.Text as="div">
                            {place.public ? <>{t('map.public') + " 🏙️"}</> : <>{t('map.private') + " 🔐"}</>}
                            <br />
                            {place.price === 0 || place.price === "" || place.price === null ? (t('map.free') + " 😎") : `${place.price} ${currencyByCountry(place.country, t)} 💸`}
                            <br />
                            <br />    {/*A hely publikus vagy privát*/}
                            <b>{t('map.openhours') + " 🕓"}</b><br /> {/*A nyitvatartási idők*/}

                            {place.opening_times.map((time, index) => {
                                return <Fragment key={index}>{`${days[index]}: ${time}`}<br /></Fragment>;    //A nyitvatartási idők megjelenítése listában
                            })}
                            <br />
                            {
                                place.rating_calculated === -1
                                    ? <>{t('map.norating') + " 🤔"}</>
                                    : <>{t('map.rating')} {(place.rating_calculated).toFixed(2) + " ⭐"}</> //Az értékelések átlaga 2 tizedesjegy pontossággal
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
