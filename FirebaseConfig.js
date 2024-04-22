import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import {getReactNativePersistence, initializeAuth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB3StdVEsSACSISgoMzDMsafWKmuG9SF7o",
    authDomain: "barcode-scanner-bb3e4.firebaseapp.com",
    projectId: "barcode-scanner-bb3e4",  
    storageBucket: "barcode-scanner-bb3e4.appspot.com",  
    messagingSenderId: "910253028051",
    appId: "1:910253028051:web:8259ae25e70a4ce5329a26",
    measurementId: "G-2N50LC3FST"
  };

  
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const DB = getFirestore(FIREBASE_APP);

