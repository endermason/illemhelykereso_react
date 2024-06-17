import React, { useState, useEffect, useContext } from 'react';
import { Col, ToggleButton, Modal, Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import AuthContext from "../contexts/logoutcontext";
import ReactStars from "react-rating-stars-component";
import { db } from "../config/firebase";
import { updateDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

const ReviewModalContent = ({ place, triggerUpdate, handleClose }) => {
    const { t } = useTranslation();

    const { currentUser } = useContext(AuthContext);

    const [review, setReview] = useState({
        rating: place.rating?.[currentUser.uid]?.rating || 0,
        text: place.rating?.[currentUser.uid]?.text || "",
    });

    const submitReview = async () => {
        const placeDocRef = doc(db, "places", place.id);

        const newPlace = await getDoc(placeDocRef);

        const newReview = {
            [currentUser.uid]: {
                rating: review.rating,
                text: review.text,
                added: serverTimestamp(),
            },
        };

        await updateDoc(placeDocRef, {
            rating: {
                ...newPlace.data().rating,
                ...newReview,
            },
        });

        triggerUpdate();
        handleClose();
    };

    const [userHasReview, setUserHasReview] = useState(false);

    useEffect(() => {
        const checkUserHasReview = async () => {
            const placeDocRef = doc(db, "places", place.id);
            const placeDoc = await getDoc(placeDocRef);

            const ratingData = placeDoc.data().rating;

            // Check if ratingData is defined and if the user has a review
            if (ratingData && ratingData.hasOwnProperty(currentUser.uid)) {
                setUserHasReview(true);
            } else {
                setUserHasReview(false);
            }
        };

        checkUserHasReview();
    }, [place, currentUser]);

    const deleteReview = async () => {
        const placeDocRef = doc(db, "places", place.id);
        const placeDoc = await getDoc(placeDocRef);

        const ratingData = placeDoc.data().rating;

        // Check if the user has a review
        if (ratingData.hasOwnProperty(currentUser.uid)) {
            // Remove the user's review
            delete ratingData[currentUser.uid];

            // Update the rating field in the place document
            await updateDoc(placeDocRef, { rating: ratingData });

            setUserHasReview(false);
            triggerUpdate();
            handleClose();
        }
    };

    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

    useEffect(() => {
        setIsSubmitEnabled(review.rating > 0);
    }, [review]);

    return (
        <>
            <Modal.Header closeButton>
                <Modal.Title>{t('review')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('rating')}</Form.Label>
                        <ReactStars
                            count={5}
                            onChange={(e) => setReview({ ...review, rating: e })}
                            size={48}
                            activeColor="#ffd700"
                            value={review.rating}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('review-text')}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={review.text}
                            onChange={(e) => setReview({ ...review, text: e.target.value })}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>{t('cancel')}</Button>
                {userHasReview && <Button variant="danger" onClick={deleteReview}>{t('delete')}</Button>}
                <Button variant="primary" onClick={submitReview} disabled={!isSubmitEnabled}>{t('submit')}</Button>
            </Modal.Footer>
        </>
    );
}



const Review = ({ place, triggerUpdate }) => {
    const { t } = useTranslation();

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);

    const handleShow = () => setShow(true);

    return (
        <>
            <Button variant="primary" onClick={handleShow} className="mb-3">{t('review')}</Button>
            <Modal show={show} onHide={handleClose}>
                {show && <ReviewModalContent place={place} triggerUpdate={triggerUpdate} handleClose={handleClose} />}
            </Modal>
        </>
    );
};

export default Review;
