import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {

  apiKey: "AIzaSyDzj4EDpkhGfLfbR3WwAOcUzsBxeXlf7PA", //process.env.REACT_APP_FIREBASE_KEY, //

  authDomain: "illemhelykereso.firebaseapp.com", //process.env.REACT_APP_FIEBASE_AUTH_DOMAIN

  projectId: "illemhelykereso", //process.env.REACT_APP_FIEBASE_PROJECT_ID,

  storageBucket: "illemhelykereso.appspot.com", //process.env.REACT_APP_FIEBASE_STORAGE_BUCKET,

  messagingSenderId: "440844589566", //process.env.REACT_APP_FIEBASE_MESSAGING_SENDER_ID,

  appId: "1:440844589566:web:f92923c5db585f48c648af", //process.env.REACT_APP_FIEBASE_APP_ID,

  measurementId: "G-JNBMYTVZSG" //process.env.REACT_APP_FIEBASE_MEASUREMENT_ID

};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();