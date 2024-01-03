import {auth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile} from "./firebaseconfig.js"

import {initializeApp, getFirestore, collection, getDocs, addDoc, deleteDoc, doc, onSnapshot,
  query, where, orderBy, serverTimestamp, getDoc, updateDoc, firebaseConfig, app, db, getAuth } from "./firebaseconfig.js"

const loginForm = document.querySelector('#login-form');
const signoutbtnEl  = document.querySelector('.signoutbtn');




onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("User is logged in:", user);
      signoutbtnEl.style.display = "block";
        

    //   window.location.href = '../index.html';




    } else {
      console.log("User is not logged in");
    }
  });



loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    signInWithEmailAndPassword(auth, email, password).then((cred) => {
        console.log('User logged in: ', cred.user);
        window.location.href = '../index.html';
    }).catch(err => console.log(err.message))
})

signoutbtnEl.addEventListener("click", e => {
e.preventDefault();
 signOut(auth).then(() => {
        console.log('User signed out')
        window.location.href = '../index.html';
        
    }).catch(err => console.log(err.message));
})

