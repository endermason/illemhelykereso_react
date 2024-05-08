import { auth, googleProvider } from '../../config/firebase';
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/logoutcontext';
import { Button, Form, Alert } from 'react-bootstrap';
import { useTranslation, Trans } from 'react-i18next';

export const Auth = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { logOut } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // Add state for error messages

    //console.log(auth?.currentUser?.email);

    const signIn = async () => {
        try {
            // Use signInWithEmailAndPassword for email/password sign-in
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch (err) {
            console.error(err);
            // Add Hungarian error handling
            if (err.code === "auth/user-not-found") {
                setError(t('login.usernotfound'));
            } else if (err.code === "auth/wrong-password") {
                setError(t('login.wrongpassword'));
            } else {
                setError(t('login.error'));
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
            console.error(err);
            // Consider adding specific error handling for Google sign-in if necessary
            setError(t('login.googleerror'));
        }
    };

    const resetPassword = () => {
        navigate("/forgotpassword");
    }

    return (
        <Form className="login-page" style={{ maxWidth: "50vw", textAlign: "center", margin: "auto", paddingTop: "10vh" }}>
            <h1 style={{ fontSize: "1em", margin: "auto", border: "5px solid red", borderRadius: "1em", width: "10em" }}>{t('login.login')}</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group controlId="email">
                <Form.Label>{t('login.email')}</Form.Label>
                <Form.Control
                    type="email"
                    placeholder={t('login.email')}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </Form.Group>
            <Form.Group controlId="password">
                <Form.Label>{t('login.password')}</Form.Label>
                <Form.Control
                    type="password"
                    placeholder={t('login.password')}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </Form.Group>
            <Button className="signin-btn" style={{ marginTop: "1vh" }} onClick={signIn}>{t('login.login')}</Button>
            <p>{t('login.or')}</p>
            <Button className="signin-with-google-btn" style={{ marginTop: "1vh", marginBottom: "2vh" }} onClick={signInWithGoogle}>{t('login.google')}</Button><br />
            {t('login.forgot')}
            <p><Trans i18nKey='login.reset'> <b onClick={resetPassword} style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}><i></i></b></Trans></p>
        </Form>

    );
};