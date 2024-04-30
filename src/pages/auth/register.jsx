import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export const Signup = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const validatePassword = (password) => {
        // Check the length
        if (password.length < 8 || password.length > 20) {
            return "A jelszónak 8-20 karakter hosszúnak kell lennie.";
        }
    
        // Check for lowercase letter
        if (!/[a-z]/.test(password)) {
            return "A jelszónak tartalmaznia kell legalább egy kisbetűt.";
        }
    
        // Check for uppercase letter
        if (!/[A-Z]/.test(password)) {
            return "A jelszónak tartalmaznia kell legalább egy nagybetűt.";
        }
    
        // Check for number
        if (!/[0-9]/.test(password)) {
            return "A jelszónak tartalmaznia kell legalább egy számot";
        }
    
        // Check for special character
        if (!/[!?.,-€@#$%^&*]/.test(password)) {
            return "A jelszónak tartalmaznia kell legalább egy speciális karaktert";
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
            setError("A jelszavaknak egyezniük kell.");
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate("/"); // Navigate to home page or dashboard after successful signup
        } catch (err) {
            console.error(err);
            // Error handling in Hungarian
            if (err.code === 'auth/email-already-in-use') {
                setError('Ez az e-mail cím már használatban van.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Érvénytelen e-mail cím formátum.');
            } else if (err.code === 'auth/weak-password') {
                setError('A jelszó túl gyenge. Legalább 6 karakter hosszúnak kell lennie.');
            } else {
                setError('Regisztrációs hiba történt. Kérjük, próbálja újra később.');
            }
        }
    };

    return (
        <Form className="signup-page" style={{maxWidth: "50vw", textAlign: "center", margin: "auto", paddingTop: "10vh"}}>
            <h1 style={{fontSize:"1em", margin:"auto", border: "5px solid red", borderRadius:"1em", width: "10em"}}>Regisztráció</h1>
            {error && <div className="error"  style={{border: "5px solid red"}}>{error}</div>}
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
            <Form.Group controlId="password" >
                <Form.Label>Jelszó megerősítése</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Jelszó megerősítése"
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                />
            </Form.Group>
            <Button className="signup-btn" onClick={signUp}>Regisztráció</Button>
        </Form>



        
    );
};