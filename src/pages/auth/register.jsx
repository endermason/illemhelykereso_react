import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Signup = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    //console.log(auth?.currentUser?.email);

    const signUp = async () => {
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
        <div className="signup-page">
            <h1>Regisztráció</h1>
            {error && <p className="error">{error}</p>}
            <input
                placeholder="E-mail cím"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                placeholder="Jelszó"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className="signup-btn" onClick={signUp}>Regisztráció</button>
        </div>
    );
};