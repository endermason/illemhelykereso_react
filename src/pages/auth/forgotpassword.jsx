import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Alert } from 'react-bootstrap';


function ForgotPassword() {                     //TODO TODO TODO TODO TODO TODO TODO CHIHOHOO TODO TODO TODO TODO TODO TODO TODO
    const navigate = useNavigate();        
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [email, setEmail] = useState("");

    const handleSubmit = async (e) => {
        setSuccess("");
        e.preventDefault();

        sendPasswordResetEmail(auth, email).then(() => {
            setSuccess("Jelszó-visszaállító e-mail elküldve.");
        }).catch((err) =>{
            console.error(err);
            // Add Hungarian error handling
            if (err.code === "auth/invalid-email") 
            {
                setError("Hibás e-mail cím.");
            }
            else if (err.code === "auth/user-disabled") 
            {
                setError("A felhasználói fiók letiltva.");
            }
            else if (err.code === "auth/too-many-requests") 
            {
                setError("Túl sok próbálkozás. Kérjük, próbálja újra később.");
            }
            else 
            {
                setError("Hiba történt. Kérjük, próbálja újra.");
            }
        });
    }
    return (
        <div>
            <h1>Elfelejtett jelszó</h1>
            {success && <Alert variant="success" className="success-message">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form className="password-reset" style={{maxWidth: "50vw", textAlign: "center", margin: "auto"}} onSubmit={handleSubmit}>
            <Form.Group controlId="email">
                <Form.Label>E-mail cím</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="E-mail cím"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </Form.Group>
            <Button type="submit">Jelszó-visszaállító e-mail küldése</Button>
            </Form>
        </div>
    )
}
export default ForgotPassword;