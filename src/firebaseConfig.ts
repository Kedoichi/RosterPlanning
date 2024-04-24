import firebase from "firebase/app";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCLggdLn6p4-iTryXx5-bTb_Nan-ejlGw",
  authDomain: "rosterplanning-298e6.firebaseapp.com",
  projectId: "rosterplanning-298e6",
  storageBucket: "rosterplanning-298e6.appspot.com",
  messagingSenderId: "475157780726",
  appId: "1:475157780726:web:f794e24b1352a1c21134d7",
  measurementId: "G-4N8FVZSDPW",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
