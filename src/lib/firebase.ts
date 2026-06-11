import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAHKbyvaNSCwx-xZ3qUF7WC08QxhySYJZU",
  authDomain: "onalans-89cba.firebaseapp.com",
  databaseURL: "https://onalans-89cba-default-rtdb.firebaseio.com",
  projectId: "onalans-89cba",
  storageBucket: "onalans-89cba.firebasestorage.app",
  messagingSenderId: "516373999592",
  appId: "1:516373999592:web:bc65b98c8dbb90c34ffe5d",
  measurementId: "G-6RQFHSN8WM"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const database = getDatabase(app);
export const auth = getAuth(app);
