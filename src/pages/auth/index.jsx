import { auth, googleProvider } from '../../config/firebase';
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
    const navigate = useNavigate();

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
                setError("Nincs ilyen felhasználó regisztrálva.");
            } else if (err.code === "auth/wrong-password") {
                setError("Hibás jelszó.");
            } else {
                setError("Bejelentkezési hiba. Kérjük, próbálja újra.");
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
            setError("Google bejelentkezési hiba. Kérjük, próbálja újra.");
        }
    };

    const logOut = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (err) {
            console.error(err);
            // Consider providing feedback on logout errors
            setError("Kijelentkezési hiba. Kérjük, próbálja újra.");
        }
    };

    return (
        <div className="login-page">
            <h1>Bejelentkezés</h1>
            {error && <div className="error-message">{error}</div>} {/* Display error messages */}
            <input placeholder="E-mail cím" type="email" onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Jelszó" type="password" onChange={(e) => setPassword(e.target.value)} />
            <button className="signin-btn" onClick={signIn}>Bejelentkezés</button>
            <button className="signin-with-google-btn" onClick={signInWithGoogle}>Jelentkezz be Google fiókkal</button>
            <button className="signout-btn" onClick={logOut}>Kijelentkezés</button>
        </div>
    );
};