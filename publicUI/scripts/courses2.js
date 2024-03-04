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





const usersRef = collection(db, "users");
const conversationsRef = collection(db, "conversations");
const coursesRef = collection(db, "courses");
const coursesContainer = document.querySelector('.courses-container');



let currUser = null;

onAuthStateChanged(auth, (user) => {
    currUser = auth.currentUser;

    // currUser.photoURL = '../images/photo-1631477076110-2b8c1fe0f3cc.avif'
    console.log("the user rn is ", currUser);

    if (user) {
        console.log("User is logged in:", user);        
        fetchCourses(); 
    }
});



function fetchCourses() {
    onSnapshot(coursesRef, snap => {
        coursesContainer.innerHTML = ''; 
        snap.docs.forEach(doc => {
            createCourseHTML(doc)            
        })
    })
}

function createCourseHTML(doc) {
    const courseData = doc.data(); 

    const courseEl = document.createElement('div')
    courseEl.classList.add('course'); 
    courseEl.dataset.id = doc.id; 
    courseEl.innerHTML = 
    `
    <div class="course-details">
        <div class="course-students">231 student</div>
        <div class="course-hourse">2hr</div>
    </div>
    <div class="course-title">${courseData['crs-name']}</div>
    <div class="course-author">Khalid</div>
    `

    courseEl.addEventListener("click", () => {
        console.log(courseEl.dataset.id);

        const courseid = courseEl.dataset.id;

        window.location.href = `./courses2.html/review/${courseid}`
        
    })

    
    coursesContainer.appendChild(courseEl)

    
}
