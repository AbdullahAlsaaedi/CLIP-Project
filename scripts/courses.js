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

const singoutEl = document.querySelector(".signout");
const signinEl = document.querySelector(".signin");


onAuthStateChanged(auth, (user) => {
    if(!user) {
        window.location.href = "../index.html"
        return; 
    }
    
    console.log(user);
    

    // user logged in 


})


singoutEl.addEventListener("click", (e) => {
    e.preventDefault();

    signOut(auth)
        .then(() => {
            console.log("User signed out");
            window.location.href = "../index.html";
        })
        .catch((err) => console.log(err.message));
});