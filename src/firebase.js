import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"; // Importe as funções do Firestore

const firebaseConfig = {
  apiKey: "AIzaSyDxCYNjMFzF90Etyu6i-OsRRknsqnYxUPA",
  authDomain: "nextone-1e5be.firebaseapp.com",
  projectId: "nextone-1e5be",
  messagingSenderId: "445200194137",
  appId: "1:445200194137:web:93724c7f3e2b9f568b6f48",
  measurementId: "G-9W7KYJ6RFC"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Exporte os módulos de autenticação e Firestore
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export { doc, getDoc, setDoc, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail };
