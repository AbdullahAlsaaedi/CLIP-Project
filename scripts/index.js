import {auth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "./firebaseconfig.js"
import {initializeApp, getFirestore, collection, getDocs, addDoc, deleteDoc, doc, onSnapshot,
  query, where, orderBy, serverTimestamp, getDoc, updateDoc, firebaseConfig, app, db, getAuth } from "./firebaseconfig.js"



const signupForm  = document.querySelector('#signup-form');
const loginForm = document.querySelector('#login-form');

const singoutEl  = document.querySelector('.signout');
const signinEl = document.querySelector('.signin');

onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is logged in:", user);
    
      signinEl.parentElement.style.display = 'none'
    } else {
      console.log("User is not logged in");
    }
  });

singoutEl.addEventListener("click", e => {
    e.preventDefault();

    signOut(auth).then(() => {
        console.log('User signed out')
        window.location.href = '../html/signin.html';
    }).catch(err => console.log(err.message));
})




const colRef = collection(db, 'posts');
console.log(colRef);
