import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


//TODO - valamiért nem működik a process.env változók használata, ezért a configot itt hagytam
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  //"AIzaSyA79uAvOjEUp4wo0FTWnkD0O7TyJfNqA1U",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  //"illemhely-b73d8.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  //"illemhely-b73d8",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  //"illemhely-b73d8.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  //"475601885110",
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  //"1:475601885110:web:9206e45a45be8692f5d317",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
  //"G-J2V7JK9LWQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const adminUser = "DeqQ3WlbNhXFCE3pr09X7rZaltH2"; // .env-ből kéne meghívni a változót, de nem működik TODO