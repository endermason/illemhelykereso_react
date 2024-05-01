import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

const PlaceStatusAlert = ({ selectedPlace }) => {
    const [alertVariant, setAlertVariant] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);

    useEffect(() => {
        if (selectedPlace) {
            let now = new Date();
            //console.log(now);
            let day = (((now.getDay() - 1) + 7) % 7);
            //console.log(day);
            let opening = selectedPlace.opening_times[day];
            //console.log(opening);
            let [openingTimeStr, closingTimeStr] = opening.split('-');
            let [openingHour, openingMinute] = openingTimeStr.split(':').map(Number);
            openingMinute = openingMinute || 0;
            let [closingHour, closingMinute] = closingTimeStr.split(':').map(Number);
            closingMinute = closingMinute || 0;

            let openingTime = new Date();
            openingTime.setUTCFullYear(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
            openingTime.setHours(openingHour, openingMinute, 0, 0);

            let closingTime = new Date();
            closingTime.setUTCFullYear(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
            closingTime.setHours(closingHour, closingMinute, 0, 0);
            //console.log("Opening time: " + openingTime, "openingHour: " + openingHour, "openingMinute: " + openingMinute);
            //console.log("Closing time: " + closingTime, "closingHour: " + closingHour, "closingMinute: " + closingMinute);
            //console.log(openingTime - now <= 30 * 60 * 1000);
            if (now < openingTime) {
                // The place is closed but will open within 30 minutes
                if (openingTime - now <= 30 * 60 * 1000) {
                    setAlertVariant('info');
                    setAlertMessage('A hely 30 percen belül nyit.');
                } else {
                    setAlertVariant('secondary');
                    setAlertMessage('A hely jelenleg zárva van.');
                }
            } else if (now > closingTime) {
                // The place is closed
                setAlertVariant('secondary');
                setAlertMessage('A hely jelenleg zárva van.');
            } else {
                // The place is open but will close within 30 minutes
                if (closingTime - now <= 30 * 60 * 1000) {
                    setAlertVariant('warning');
                    setAlertMessage('A hely 30 percen belül bezár.');
                } else {
                    setAlertVariant('primary');
                    setAlertMessage('A hely jelenleg nyitva van.');
                }
            }
        }
    }, [selectedPlace]);

    return (
        alertVariant && alertMessage && <Alert variant={alertVariant}>{alertMessage}</Alert>
    );
};

export default PlaceStatusAlert;