// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyDzj4EDpkhGfLfbR3WwAOcUzsBxeXlf7PA",

  authDomain: "illemhelykereso.firebaseapp.com",

  projectId: "illemhelykereso",

  storageBucket: "illemhelykereso.appspot.com",

  messagingSenderId: "440844589566",

  appId: "1:440844589566:web:f92923c5db585f48c648af",

  measurementId: "G-JNBMYTVZSG"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);