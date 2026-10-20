// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4SjJHb_PO3PANQKaVz0LLl6cmGClDado",
  authDomain: "chronoglobe-22cd5.firebaseapp.com",
  projectId: "chronoglobe-22cd5",
  storageBucket: "chronoglobe-22cd5.firebasestorage.app",
  messagingSenderId: "1013000382281",
  appId: "1:1013000382281:web:efa9017564b81ddb411c98",
  measurementId: "G-XKEJY8DV3N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
