import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useTranslation } from 'react-i18next';

export const Signup = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const validatePassword = (password) => {
        // Check the length
        if (password.length < 8 || password.length > 20) {
            return t('error.characters') //"A jelszónak 8-20 karakter hosszúnak kell lennie.";
        }
    
        // Check for lowercase letter
        if (!/[a-z]/.test(password)) {
            return t('error.lowercase') //"A jelszónak tartalmaznia kell legalább egy kisbetűt.";
        }
    
        // Check for uppercase letter
        if (!/[A-Z]/.test(password)) {
            return t('error.uppercase') //"A jelszónak tartalmaznia kell legalább egy nagybetűt.";
        }
    
        // Check for number
        if (!/[0-9]/.test(password)) {
            return t('error.number') //"A jelszónak tartalmaznia kell legalább egy számot.";
        }
    
        // Check for special character
        if (!/[!?.,-€@#$%^&*]/.test(password)) {
            return t('error.special') //"A jelszónak tartalmaznia kell legalább egy speciális karaktert.";
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
            setError(t('error.samepassword')); //"A jelszavaknak egyezniük kell."
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate("/"); // Navigate to home page or dashboard after successful signup
        } catch (err) {
            console.error(err);
            // Error handling in Hungarian
            if (err.code === 'auth/email-already-in-use') {
                setError(t('error.alreadyinuse')); //Ez az e-mail cím már használatban van.
            } else if (err.code === 'auth/invalid-email') {
                setError(t('error.invalidemail')) //Érvénytelen e-mail cím formátum.
            } else {
                setError(t('error.error')) //Regisztrációs hiba történt. Kérjük, próbálja újra később.
            }
        }
    };

    return (
        <Form className="signup-page" style={{maxWidth: "50vw", textAlign: "center", margin: "auto", paddingTop: "10vh"}}>
            <h1 style={{fontSize:"1em", margin:"auto", border: "5px solid red", borderRadius:"1em", width: "10em"}}>{t('register.register')}</h1>
            {error && <div className="error"  style={{border: "5px solid red"}}>{error}</div>}
            <Form.Group controlId="email">
                <Form.Label>{t('register.email')}</Form.Label>
                <Form.Control
                    type="email"
                    placeholder={t('register.email')}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </Form.Group>
            <Form.Group controlId="password">
                <Form.Label>{t('register.password')}</Form.Label>
                <Form.Control
                    type="password"
                    placeholder={t('register.password')}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </Form.Group>
            <Form.Group controlId="password" >
                <Form.Label>{t('register.confirmpassword')}</Form.Label>
                <Form.Control
                    type="password"
                    placeholder={t('register.confirmpassword')}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                />
            </Form.Group>
            <Button className="signup-btn" onClick={signUp}>{t('register.register')}</Button>
        </Form>
    );
};