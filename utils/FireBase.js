// utils/FireBase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBdDId0PpQpoPYMwtyMpyRf2eAvz7Sysxc",
  authDomain: "appspeqtrumbd.firebaseapp.com",
  projectId: "appspeqtrumbd",
  storageBucket: "appspeqtrumbd.appspot.com",
  messagingSenderId: "177239265740",
  appId: "1:177239265740:web:11dc40c22ac7cf8eb6cd69",
  measurementId: "G-NW98W2QEK2"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const storage = getStorage(app);
const firestore = getFirestore(app);

export { app, storage, firestore, auth };
