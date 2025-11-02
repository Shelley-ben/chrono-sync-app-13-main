import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAc72uUOLnJIs_wPeGqNipWInPf2tZEM-s",
  authDomain: "demanual-ai-29542.firebaseapp.com",
  projectId: "demanual-ai-29542",
  storageBucket: "demanual-ai-29542.firebasestorage.app",
  messagingSenderId: "432280150957",
  appId: "1:432280150957:web:15077a658aacd972837724",
  measurementId: "G-4LW4W8GYHW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
