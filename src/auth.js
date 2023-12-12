import { initializeApp } from "firebase/app";
import {
    getFirestore, collection, getDocs, addDoc, deleteDoc, doc, onSnapshot,
    query, where, orderBy, serverTimestamp, getDoc, updateDoc, 
} from 'firebase/firestore'

import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged

} from 'firebase/auth'

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
const colRef = collection(db, 'post')




const signupForm  = document.querySelector('#signup-form');
const loginForm = document.querySelector('#login-form');

const singoutEl  = document.querySelector('.signout');

// const user = getAuth(auth).currentUser;

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is logged in. 'user' will contain user information.      
      console.log("User is logged in:", user);
      // You can perform actions for authenticated users here.
    //   window.location.href = 'index.html';
    } else {
      // User is not logged in.
      console.log("User is not logged in");
      // You can handle actions for non-authenticated users here.
      //   window.location.href = 'signin.html';

    }
  });

signupForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = signupForm.email.value;
    const password = signupForm.password.value;

    createUserWithEmailAndPassword(auth, email, password).then((cred) => {
        console.log('User Created: ', cred.user);
    }).catch(err => console.log(err.message))
})

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    signInWithEmailAndPassword(auth, email, password).then((cred) => {
        console.log('User logged in: ', cred.user);
        window.location.href = '../html/index.html';
    }).catch(err => console.log(err.message))
})



singoutEl.addEventListener("click", e => {
    e.preventDefault();

    signOut(auth).then(() => {
        console.log('User signed out')
        window.location.href = '../html/signin.html';
    }).catch(err => console.log(err.message));
})




