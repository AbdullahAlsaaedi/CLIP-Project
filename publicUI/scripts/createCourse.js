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

onAuthStateChanged(auth, (user) => {
    console.log(user);

    const uid = user.uid; 
    console.log(uid);

    const hiddenUIDinput = document.getElementById('userUid'); 
    hiddenUIDinput.value = uid; 
    console.log(hiddenUIDinput);

    
})


const usersRef = collection(db, "users");
console.log("test");
