import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { db, adminUser } from "../config/firebase";
import ReactStars from "react-rating-stars-component";
import AuthContext from "../contexts/logoutcontext";


import { doc, getDoc, updateDoc } from "firebase/firestore";

const ShowReviewsModalContent = ({ place, triggerUpdate }) => {
    const { t } = useTranslation();
    const { currentUser } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            const placeDocRef = doc(db, "places", place.id);
            const placeDoc = await getDoc(placeDocRef);
            const placeData = placeDoc.data();

            let reviews = [];
            Object.entries(placeData.rating || {}).map(([id, review]) => {
                reviews.push({ id, ...review });
            });
            setReviews(reviews);
        };

        fetchReviews();
    }, [place]);

    const [sortType, setSortType] = useState('added-desc');
    const [sortedReviews, setSortedReviews] = useState([]);

    useEffect(() => {
        let sorted = [...reviews];
        switch (sortType) {
            case 'added-asc':
                sorted.sort((a, b) => a.added.toDate() - b.added.toDate());
                break;
            case 'added-desc':
                sorted.sort((a, b) => b.added.toDate() - a.added.toDate());
                break;
            case 'rating-asc':
                sorted.sort((a, b) => a.rating - b.rating);
                break;
            case 'rating-desc':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            default:
                break;
        }
        setSortedReviews(sorted);
    }, [reviews, sortType]);

    const deleteReview = async (id) => {
        const placeDocRef = doc(db, "places", place.id);
        const placeDoc = await getDoc(placeDocRef);

        const ratingData = placeDoc.data().rating;

        // Remove the review with the specified id
        delete ratingData[id];

        // Update the rating field in the place document
        await updateDoc(placeDocRef, { rating: ratingData });

        let reviews = [];
        Object.entries(ratingData).map(([id, review]) => {
            reviews.push({ id, ...review });
        });
        setReviews(reviews);

        triggerUpdate();
    };

    const sortTypeLabels = {
        'added-asc': t('places.sort.added-asc'),
        'added-desc': t('places.sort.added-desc'),
        'rating-asc': t('places.sort.rating-asc'),
        'rating-desc': t('places.sort.rating-desc'),
    };

    return (
        <>
            <Modal.Header closeButton>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Modal.Title className='mx-2 d-flex align-items-center'>{t('reviews')}</Modal.Title>
                </div>
            </Modal.Header>
            <Modal.Body>
                <Dropdown onSelect={(key) => setSortType(key)}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Dropdown.Toggle variant="success" id="dropdown-basic" className='mb-2'
                            style={{ fontSize: "10pt", whiteSpace: "normal", wordWrap: "break-word" }}>
                            {sortTypeLabels[sortType]}
                        </Dropdown.Toggle>
                    </div>

                    <Dropdown.Menu>
                        <Dropdown.Item eventKey="added-asc">{t('places.sort.added-asc')}</Dropdown.Item>
                        <Dropdown.Item eventKey="added-desc">{t('places.sort.added-desc')}</Dropdown.Item>
                        <Dropdown.Item eventKey="rating-asc">{t('places.sort.rating-asc')}</Dropdown.Item>
                        <Dropdown.Item eventKey="rating-desc">{t('places.sort.rating-desc')}</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                {sortedReviews.map((review, index) => (
                    <div key={index} className="mb-3" style={{ borderRadius: "2rem", backgroundColor: "aliceblue" }}>
                        <div className="mb-2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {currentUser && (
                                review.id === currentUser.uid   // Ha bejelentkezett felhasználó és nem admin, akkor csak a saját értékelését jelzi, a többi felhasználó azonosítóját nem
                                    ? <p1><i><b>{t('ownreview')}</b></i></p1>
                                    : (adminUser === currentUser.uid && <p1>{review.id}</p1>)   // Ha admin, akkor a saját értékelését jelzi, és a többi felhasználó azonosítóját 
                            )}
                            <p3>{review.added.toDate().toLocaleDateString()}</p3>
                            <p1>{t('rating')}:</p1>
                            <ReactStars
                                count={5}
                                //activeColor={"gold"}
                                size={30}
                                value={review.rating}
                                edit={false}
                            />
                            {review.text && <p1>{t('review-text')}:</p1>}
                            <p2>{review.text}</p2>
                            {currentUser && (currentUser.uid === adminUser || review.id === currentUser.uid) ?  // Ha bejelentkezett felhasználó és nem admin, akkor csak a saját értékelését törölheti, a többi felhasználó értékelését nem    
                                <Button className="mb-2" variant="danger" onClick={() => deleteReview(review.id)}>{t('delete')}</Button>    // Ha admin, akkor bármelyik felhasználó értékelését törölheti, beleértve a sajátját is
                                : ""}
                        </div>
                    </div>
                ))}
            </Modal.Body>
        </>
    );
};

const ShowReviews = ({ place, triggerUpdate }) => {
    const { t } = useTranslation();

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            {place.rating && Object.keys(place.rating).length > 0 && (
                <Button variant="primary" onClick={handleShow} className="mb-3">{t('show-reviews')}</Button>
            )}

            <Modal show={show} onHide={handleClose}>
                {show && <ShowReviewsModalContent place={place} handleClose={handleClose} triggerUpdate={triggerUpdate} />}
            </Modal>
        </>
    );
};

export default ShowReviews;