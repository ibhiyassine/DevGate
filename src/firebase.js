// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBY6k5tNXXWjyinQlQ6_vwLKDqhW08tHqE",
  authDomain: "devgate-80341.firebaseapp.com",
  projectId: "devgate-80341",
  storageBucket: "devgate-80341.firebasestorage.app",
  messagingSenderId: "511921887594",
  appId: "1:511921887594:web:a9b851e54b52fa98b62d13",
  measurementId: "G-7ESQ5L78HD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
