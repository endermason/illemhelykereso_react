import { auth, googleProvider } from '../../config/firebase';
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/logoutcontext';
import { Button, Form, Alert, Container } from 'react-bootstrap';
import { useTranslation, Trans } from 'react-i18next';

export const Auth = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { logOut } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // Add state for error messages

    useEffect(() => { document.title = t("login.login") + " | " + t("nav.main"); });

    useEffect(() => {
        //timeout for alert message, remove after 5 seconds
        if (error) {
            const timeout = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [error]);

    const signIn = async () => {
        try {
            // Use signInWithEmailAndPassword for email/password sign-in
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch (err) {
            console.error(err);
            // Add Hungarian error handling
            if (err.code === "auth/user-not-found") {
                setError('error.usernotfound');
            } else if (err.code === "auth/wrong-password") {
                setError('error.wrongpassword');
            } else {
                setError('error.error');
            }
        }
    };

    const signInWithGoogle = async () => {
        try {
            const results = await signInWithPopup(auth, googleProvider);
            const authInfo = {
                userID: results.user.uid,
                name: results.user.displayName,
                profilePhoto: results.user.photoURL,
                isAuth: true,
            };
            localStorage.setItem("auth", JSON.stringify(authInfo));
            navigate("/");
        } catch (err) {
            setError('error.googleerror');
        }
    };

    const resetPassword = () => {
        navigate("/forgotpassword");
    }

    return (
        <>
            <Container>
                <div style={{ height: '2em' }}>
                    {error && <Alert variant="danger">{t(error)}</Alert>}
                </div>
                <Form className="login-page" style={{ textAlign: "center", margin: "2em auto 1em" }}>
                    <h2>{t('login.login')}</h2>
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
                </Form>
            </Container>
            <Button className="signin-btn" style={{ marginBottom: "1rem" }} onClick={signIn}>{t('login.login')}</Button>
            <p>{t('login.or')}</p>
            <button className="gsi-material-button" onClick={signInWithGoogle} style={{ marginTop: "1vh", marginBottom: "1rem" }}>
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: "block" }}>
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                    </div>
                    <span className="gsi-material-button-contents">{t('login.google')}</span>
                </div>
            </button><br />
            {t('login.forgot')}
            <p><Trans i18nKey='login.reset'> <b onClick={resetPassword} style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}></b></Trans></p>
        </>
    );
};