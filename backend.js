// backend.js
// This file handles Authentication and Database operations using Firebase SDKs

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================================
// 1. CONFIGURATION (PASTE YOUR KEYS HERE)
// ==========================================
const firebaseConfig = {
   apikey: "AIzaSyCbK2_U9zsDTYLFoMWiGGdMUMmHdYxj07I",
authDomain: "pdf-tool-backend.firebaseapp.com",
projectId: "pdf-tool-backend",
storageBucket: "pdf-tool-backend.firebasestorage.app",
messagingSenderId: "962217219662",
appId: "1:962217219662:web:49de1f9f7bc809add7151f",
measurementId: "G-D89CCEL62M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// 2. AUTHENTICATION FUNCTIONS
// ==========================================

// Login with Google
export const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        console.log("User logged in:", user);
        return user;
    } catch (error) {
        console.error("Error during Google login:", error);
        throw error;
    }
};

// Login with Email
export const loginWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Email login error:", error);
        throw error;
    }
};

// Sign Up with Email
export const signUpWithEmail = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Signup error:", error);
        throw error;
    }
};

// Logout
export const logoutUser = async () => {
    try {
        await signOut(auth);
        console.log("User logged out");
    } catch (error) {
        console.error("Logout error:", error);
    }
};

// Listen for Authentication State Changes (Is user logged in?)
// This function will run whenever the login status changes
export const initAuthListener = (callback) => {
    onAuthStateChanged(auth, (user) => {
        callback(user);
    });
};

// ==========================================
// 3. DATABASE FUNCTIONS (STORING DATA)
// ==========================================

// Save a record when a user uses a tool
export const logUserActivity = async (userId, toolName, fileName) => {
    try {
        const docRef = await addDoc(collection(db, "users", userId, "activity"), {
            toolName: toolName,
            fileName: fileName,
            timestamp: serverTimestamp() // Uses Firebase server time
        });
        console.log("Activity logged with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

// Get user's recent history
export const getUserHistory = async (userId) => {
    try {
        const q = query(
            collection(db, "users", userId, "activity"), 
            orderBy("timestamp", "desc"), 
            limit(5)
        );
        const querySnapshot = await getDocs(q);
        const history = [];
        querySnapshot.forEach((doc) => {
            history.push({ id: doc.id, ...doc.data() });
        });
        return history;
    } catch (error) {
        console.error("Error getting history:", error);
        return [];
    }
};

