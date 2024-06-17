import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Alert, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

export const Signup = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    useEffect(() => { document.title = t("register.register") + " | " + t("nav.main"); });

    useEffect(() => {
        //timeout for alert message, remove after 5 seconds
        if (error) {
            const timeout = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [error]);

    const validatePassword = (password) => {
        // Check the length
        if (password.length < 8 || password.length > 20) {
            return 'error.characters' //"A jelszónak 8-20 karakter hosszúnak kell lennie."; 
        }

        // Check for lowercase letter
        if (!/[a-z]/.test(password)) {
            return 'error.lowercase' //"A jelszónak tartalmaznia kell legalább egy kisbetűt.";
        }

        // Check for uppercase letter
        if (!/[A-Z]/.test(password)) {
            return 'error.uppercase' //"A jelszónak tartalmaznia kell legalább egy nagybetűt.";
        }

        // Check for number
        if (!/[0-9]/.test(password)) {
            return 'error.number' //"A jelszónak tartalmaznia kell legalább egy számot.";
        }

        // Check for special character
        if (!/[!?.,€@#$%^&*\-]/.test(password)) {
            return 'error.special' //"A jelszónak tartalmaznia kell legalább egy speciális karaktert.";
        }

        // If all conditions are met
        return null;
    };

    const signUp = async (e) => {
        e.preventDefault();

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (password !== passwordConfirm) {
            setError('error.samepassword'); //"A jelszavaknak egyezniük kell."
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate("/"); //Sikeres regisztráció esetén a főoldalra irányít át.
        } catch (err) {
            console.error(err);
            // Error handling
            if (err.code === 'auth/email-already-in-use') {
                setError('error.alreadyinuse'); //Ez az e-mail cím már használatban van.
            } else if (err.code === 'auth/invalid-email') {
                setError('error.invalidemail') //Érvénytelen e-mail cím formátum.
            } else {
                setError('error.error') //Regisztrációs hiba történt. Kérjük, próbálja újra később.
            }
        }
    };

    return (
        <>
            <Container>
                <div style={{ height: '2em' }}>
                    {error && <Alert variant="danger">{t(error)}</Alert>}
                </div>
                <Form className="signup-page" style={{ textAlign: "center", margin: "2em auto 1em" }}>
                    <h2>{t('register.register')}</h2>
                    <Form.Group controlId="email">
                        <Form.Label>{t('email')}</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder={t('email')}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>{t('password')}</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder={t('password')}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>{t('register.confirmpassword')}</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder={t('register.confirmpassword')}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Container>
            <Button className="signup-btn" onClick={signUp}>{t('register.register')}</Button>
        </>
    );
};