// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
    getFirestore, collection, getDocs, addDoc, deleteDoc, doc, onSnapshot,
    query, where, orderBy, serverTimestamp, getDoc, updateDoc
} from 'firebase/firestore'

import {
  getAuth
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBciolYGlX5URQC6MV5AhPDEGDo-E8vcJ0",
  authDomain: "clip-4cdf9.firebaseapp.com",
  projectId: "clip-4cdf9",
  storageBucket: "clip-4cdf9.appspot.com",
  messagingSenderId: "29307730572",
  appId: "1:29307730572:web:d25e8bd775e2a45b1199a9"
};

 
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// init services
const db = getFirestore();

const auth = getAuth(app);







// collection ref 
const colRef = collection(db, 'posts')

// addDoc(colRef, {"title": "Exponents", "author": "lol"})
// const q = query(colRef, where('title', '==', 'Exponents'), orderBy('num', 'desc'))

// get collection data
onSnapshot(q, snapshot => {
    let posts = []
    snapshot.docs.forEach(el => posts.push({...el.data(), id: el.id})) 

    console.log(posts);
    
});


// const docRef = doc(db, 'post', '9xBOnNT02hJ1wjEvG7BL')
// deleteDoc(docRef)

// let doc1 = doc(db, "post", "KwOnbCaejZStfsBsfcG3");

// const newdoc = getDoc(doc1).then(doc => {
//   console.log(doc.data());
// })

// onSnapshot(doc1, snapshot => console.log(snapshot.data()));


