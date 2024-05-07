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
    arrayUnion, 
    arrayRemove, 
    getStorage, ref, getDownloadURL, limit
} from "./firebaseconfig.js";


const usersRef = collection(db, "users");
const recsRef = collection(db, "recommended_courses");

let currUser = null;


onAuthStateChanged(auth, (user) => {
    currUser = auth.currentUser;

    if (user) { 
        fetchRecs()
        
    }
});



function fetchRecs() {

    const q = query(recsRef, limit(20));  // Adjust the limit as needed

     onSnapshot(q, (snapshot) => {
        snapshot.docs.forEach((doc) => {
            displayRecs(doc);
        });
    });

}


function displayRecs(doc) {

    const recsContainer = document.querySelector('.recs-container-recs '); 

    const courseEl = document.createElement('div'); 
    courseEl.classList.add('course-recs'); 


    const data = doc.data(); 
    const title = data.course_title; 
    const recsCourses = data.recommended_courses; 




    courseEl.innerHTML = 
    `
    <div class="course-heading-recs ">
        <div class="course-name-recs">${title}</div>
        <button class="course-btn-recs ">more recommendations</button>
    </div>

    <div class="recs-recs">
       
    </div>
    `


    const recsContainer2 = courseEl.querySelector('.recs-recs'); 

    recsCourses.forEach(el => {
        const rec = document.createElement('div'); 
        rec.classList.add('rec-recs'); 

        rec.innerHTML = 
        `
        <div class="rec-name">${el}</div>
        `

        recsContainer2.appendChild(rec)
    })


    const btn = courseEl.querySelector('.course-btn-recs '); 
    dropDownMenuEvent(btn);


    recsContainer.appendChild(courseEl)

}

document.addEventListener('DOMContentLoaded', function () {
    
});

function dropDownMenuEvent(button) {
        button.addEventListener('click', function () {
            const recs = this.parentElement.parentElement.querySelector('.recs-recs');
            if (recs.classList.contains('show')) {
                recs.style.height = "0px"; // Collapse the menu
                recs.classList.remove('show');
            } else {
                recs.classList.add('show');
                recs.style.height = recs.scrollHeight + "px"; // Set height to allow transition
                setTimeout(() => { recs.style.height = "auto"; }, 500); // Transition to auto after animation
            }
        });
}