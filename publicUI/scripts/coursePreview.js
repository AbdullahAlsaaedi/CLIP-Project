import {
    auth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "./firebaseconfig.js";
import {
    initializeApp,
    getFirestore,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    getDoc,
    updateDoc,
    firebaseConfig,
    app,
    db,
    getAuth,
} from "./firebaseconfig.js";


const enrollbtn = document.querySelector(".enrollbtn"); 
const usersRef = collection(db, "users");


enrollbtn.addEventListener("click", () => {
    let url = window.location.href; 
    let parts = url.split("/"); // Split the URL by "/"
    let lastPart = parts[parts.length - 1]; // Get the last part of the array
    console.log(lastPart);
    
    window.location.href = `/html/courses2.html/${lastPart}`
})

// const query = query(usersRef, where())
// onSnapshot(usersRef)
