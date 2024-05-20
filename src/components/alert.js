import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const PlaceStatusAlert = ({ selectedPlace }) => {
    const { i18n, t } = useTranslation();
    const [alertVariant, setAlertVariant] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);

    useEffect(() => {
        if (selectedPlace) {
            let now = new Date(); 
            let day = (((now.getDay() - 1) + 7) % 7);
            let opening = selectedPlace.opening_times[day];
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
            if (now < openingTime) {
                if (openingTime - now <= 30 * 60 * 1000) {
                    setAlertVariant('info');
                    setAlertMessage("⌛ "+t('alert.openswithin30')+" ⌛");
                } else {
                    setAlertVariant('danger');
                    setAlertMessage("⛔ "+t('alert.closed')+" ⛔");
                }
            } else if (now > closingTime) {
                setAlertVariant('danger');
                setAlertMessage("⛔ "+t('alert.closed')+" ⛔");
            } else {
                if (closingTime - now <= 30 * 60 * 1000) {
                    setAlertVariant('warning');
                    setAlertMessage("⚠️ "+t('alert.closeswithin30')+" ⚠️");
                } else {
                    setAlertVariant('success');
                    setAlertMessage("👌 "+t('alert.open')+" 👌");
                }
            }
        }
    }, [selectedPlace, i18n.resolvedLanguage]);

    return (
        alertVariant && alertMessage && <Alert variant={alertVariant}>{alertMessage}</Alert>
    );
};

export default PlaceStatusAlert;