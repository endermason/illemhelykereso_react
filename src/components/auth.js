import {auth, googleProvider} from "../config/firebase";
import {createUserWithEmailAndPassword, signInWithPopup,signOut} from "firebase/auth";
import {useState} from "react";

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
   
    const signIn = async () => {
        try{
        await createUserWithEmailAndPassword(auth,email,password);
        } catch(err) {console.error(err)};
    };
    const signInWithGoogle = async () => {
        try{
        await signInWithPopup(auth,googleProvider);
        } catch(err) {console.error(err)};
    };

    const logOut = async () => {
        try{
        await signOut(auth);
        } catch(err) {console.error(err)};
    };

    return (
      <div>
        <input 
        placeholder="E-mail cím" 
        onChange={(e) => setEmail(e.target.value)}
        />
        <input 
        placeholder="Jelszó"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={signIn}>Bejelentkezés</button>

        <button onClick={signInWithGoogle}>Jelentkezz be Google fiókkal</button>

        <button onClick={logOut}>Kijelentkezés</button>
      </div>
    );
};