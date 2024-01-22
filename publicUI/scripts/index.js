import {auth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "./firebaseconfig.js"
import {initializeApp, getFirestore, collection, getDocs, addDoc, deleteDoc, doc, onSnapshot,
  query, where, orderBy, serverTimestamp, getDoc, updateDoc, firebaseConfig, app, db, getAuth } from "./firebaseconfig.js"



const signupForm  = document.querySelector('#signup-form');
const loginForm = document.querySelector('#login-form');

const singoutEl  = document.querySelector('.signout');
const signinEl = document.querySelector('.signin');
const profileLinkCon = document.querySelector('.profile-link-container'); 
const profileLink = document.querySelector('.profile-link'); 

const usersRef = collection(db, 'users');


onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is logged in:", user);
      signinEl.parentElement.style.display = 'none'
      singoutEl.classList.remove("hidden")


      const q = query(usersRef, where('uid', '==', user.uid));

      getDocs(q).then(querySnapshot => {
        
            const user = querySnapshot.docs[0];
            profileLink.href = `/user/${user.id}`
            profileLinkCon.classList.remove('hidden');
        
        
      })



    } else {
      console.log("User is not logged in");
    }
  });

singoutEl.addEventListener("click", e => {
    e.preventDefault();

    singoutEl.classList.add("hidden")


    signOut(auth).then(() => {
        console.log('User signed out')
        window.location.href = '../html/signin.html';
    }).catch(err => console.log(err.message));
})

