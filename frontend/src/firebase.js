import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB4Je9M2PZPFje33mBiYb-U0p9SIU1Q2bA",
  authDomain: "legaltech-1431.firebaseapp.com",
  projectId: "legaltech-1431",
  storageBucket: "legaltech-1431.firebasestorage.app",
  messagingSenderId: "1052818001937",
  appId: "1:1052818001937:web:73ac4b018eb9b90cbd61b0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;
