import { auth, googleProvider } from '../../config/firebase';
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/logoutcontext';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


export const Auth = () => {
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

    const resetPassword = () => {
        navigate("/forgotpassword");
    }

    return (
        // <div className="login-page">
        //     <h1>Bejelentkezés</h1>
        //     {error && <div className="error-message">{error}</div>} {/* Display error messages */}
        //     <input placeholder="E-mail cím" type="email" onChange={(e) => setEmail(e.target.value)} />
        //     <input placeholder="Jelszó" type="password" onChange={(e) => setPassword(e.target.value)} />
        //     <button className="signin-btn" onClick={signIn}>Bejelentkezés</button>
        //     <button className="signin-with-google-btn" onClick={signInWithGoogle}>Jelentkezz be Google fiókkal</button>
        //     <button className="signout-btn" onClick={logOut}>Kijelentkezés</button>
        //     <br/>
        //     <p></p>
        // </div>

        <Form className="login-page" style={{maxWidth: "50vw", textAlign: "center", margin: "auto", paddingTop: "10vh"}}>
            <h1 style={{fontSize:"1em", margin:"auto", border: "5px solid red", borderRadius:"1em", width: "10em"}}>Bejelentkezés</h1>
            {error && <div className="error-message"  style={{border: "5px solid red"}}>{error}</div>}
            <Form.Group controlId="email">
                <Form.Label>E-mail cím</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="E-mail cím"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </Form.Group>
            <Form.Group controlId="password">
                <Form.Label>Jelszó</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Jelszó"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </Form.Group>
            <Button className="signin-btn" style={{marginTop:"1vh"}} onClick={signIn}>Bejelentkezés</Button>
            <p>vagy</p>
            <Button className="signin-with-google-btn" style={{marginTop:"1vh", marginBottom:"2vh"}} onClick={signInWithGoogle}>Jelentkezz be Google fiókkal</Button>
            <h2>Elfelejtetted a jelszavad? <b onClick={resetPassword} style={{color: "blue", textDecoration: "underline", cursor: "pointer"}}><i>itt</i></b> visszaállíthatod.</h2>
        </Form>
        
    );
};