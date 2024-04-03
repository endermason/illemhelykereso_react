import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {

  apiKey: "AIzaSyDzj4EDpkhGfLfbR3WwAOcUzsBxeXlf7PA",

  authDomain: "illemhelykereso.firebaseapp.com",

  projectId: "illemhelykereso",

  storageBucket: "illemhelykereso.appspot.com",

  messagingSenderId: "440844589566",

  appId: "1:440844589566:web:f92923c5db585f48c648af",

  measurementId: "G-JNBMYTVZSG"

};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();