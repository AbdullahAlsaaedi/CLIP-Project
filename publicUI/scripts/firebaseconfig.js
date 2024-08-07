import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";

import {
    getFirestore, collection, getDocs, addDoc, deleteDoc, doc, setDoc, onSnapshot,
    query, where, orderBy, serverTimestamp, getDoc, updateDoc, arrayUnion, arrayRemove, increment, limit
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js'

import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js'

import {
    getStorage, ref, uploadBytes, getDownloadURL, deleteObject
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js'

const firebaseConfig = {
  apiKey: "AIzaSyBciolYGlX5URQC6MV5AhPDEGDo-E8vcJ0",
  authDomain: "clip-4cdf9.firebaseapp.com",
  projectId: "clip-4cdf9",
  storageBucket: "clip-4cdf9.appspot.com",
  messagingSenderId: "29307730572",
  appId: "1:29307730572:web:d25e8bd775e2a45b1199a9"
};


 
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth(app);

const colRef = collection(db, 'posts')


export {initializeApp, getFirestore, collection, setDoc, getDocs, addDoc, deleteDoc, doc, onSnapshot,
    query, where, arrayRemove, orderBy, GoogleAuthProvider, signInWithPopup, serverTimestamp, arrayUnion, getDoc, updateDoc, firebaseConfig, app, db, auth, colRef, getAuth,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, limit, onAuthStateChanged, updateProfile, getStorage, ref, uploadBytes, getDownloadURL, deleteObject, increment
}