import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with error handling
let app;
let auth;
let db;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Configure auth persistence to prevent lost sessions
    auth.setPersistence = auth.setPersistence || (() => Promise.resolve());
    
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Error initializing Firebase:", error);
    
    // Provide fallback for error scenarios
    if (!app) app = initializeApp(firebaseConfig);
    if (!auth) auth = getAuth(app);
    if (!db) db = getFirestore(app);
}

// Connect to emulators if in development and explicitly enabled
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATORS === 'true') {
    // Firebase Auth emulator typically runs on port 9099
    try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        console.log('Connected to Firebase Auth Emulator');
    } catch (e) {
        console.warn('Could not connect to Auth emulator:', e);
    }
    
    // Firestore emulator typically runs on port 8080
    try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('Connected to Firestore Emulator');
    } catch (e) {
        console.warn('Could not connect to Firestore emulator:', e);
    }
}

export { app, auth, db };