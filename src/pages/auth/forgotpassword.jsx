import { sendPasswordResetEmail } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Alert, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';


function ForgotPassword() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [email, setEmail] = useState("");

    useEffect(() => { document.title = t("reset.reset") + " | " + t("nav.main"); });

    useEffect(() => {
        //timeout for alert message, remove after 5 seconds
        if (error) {
            const timeout = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [error]);

    const handleSubmit = async (e) => {
        setSuccess("");
        setEmail("");
        e.preventDefault();

        sendPasswordResetEmail(auth, email).then(() => {
            setSuccess(t('reset.emailsent')); //"Jelszó-visszaállító e-mail elküldve.
        }).catch((err) => {
            // Add Hungarian error handling
            if (email === "") {
                setError(t('error.emptyemail')); //"Az e-mail cím nem lehet üres."
            }
            else if (err.code === "auth/user-disabled") {
                setError(t('error.disableduser')); //"A felhasználói fiók le van tiltva."
            }
            else if (err.code === "auth/too-many-requests") {
                setError(t('error.toomanyrequests')); //"Túl sok próbálkozás. Kérjük, próbálja újra később."
            }
            else if (err.code === "auth/invalid-email") {
                setError(t('error.invalidemail')); //"Érvénytelen e-mail cím."
            }
            else {
                setError(t('error.error')); //"Hiba történt. Kérjük, próbálja újra később."
            }
        });
    }
    return (
        <div>
            <Container>
                <div style={{ height: '2em' }}>
                    {success && <Alert variant="success" className="success-message" dismissible>{success}</Alert>}
                    {error && !success && <Alert variant="danger" dismissible>{t(error)}</Alert>}
                </div>
                <Form className="password-reset" style={{ textAlign: "center", margin: "2em auto" }} onSubmit={handleSubmit}>
                    <h2>{t('reset.reset')}</h2>
                    <Form.Group controlId="email">
                        <Form.Label>{t('reset.email')}</Form.Label>
                        <Form.Control
                            //type="email"
                            placeholder={t('email')}
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>
                    <Button style={{ marginTop: "1em" }} type="submit">{t('reset.sendemail')}</Button>
                </Form>
            </Container>
        </div>
    )
}
export default ForgotPassword;