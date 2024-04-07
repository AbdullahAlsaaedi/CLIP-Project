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

    const courseEl = document.createElement('div');
    courseEl.classList.add('course');
    courseEl.dataset.id = doc.id; 
    courseEl.innerHTML = `
        <div class="course-author">Khalid</div>
        <div class="course-title">${courseData['crs-name']}</div>
        <div class="course-details">
            <div class="course-students">231 student</div>
        </div>
    `;

    // Get reference to the course container
    const coursesContainer = document.querySelector('.courses-container');

    // Get all existing .course elements
    const existingCourses = coursesContainer.querySelectorAll('.course');

    // Set darker color options
    const darkerColors = ['#440000', '#002244', '#002200', '#220022', '#222200', '#002222', '#220000', '#000022', '#002222', '#220022', '#002222', '#220022', '#222200'];

    // Set available colors excluding the ones already used by existing courses
    const availableColors = darkerColors.filter(color => !Array.from(existingCourses).some(course => getComputedStyle(course).getPropertyValue('--bg-color') === color));

    // Set background color for the new course element
    if (availableColors.length > 0) {
        const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        courseEl.style.setProperty('--bg-color', randomColor);
    } else {
        // Fallback color if no available colors are found
        courseEl.style.setProperty('--bg-color', '#333333'); // Dark grey color
    }

    // Update the number of students
    const numOfStudents = courseEl.querySelector('.course-students');
    const enrolledStudents = courseData.enrolledStudents || [];
    numOfStudents.textContent = `${enrolledStudents.length} Students`;

    // Add event listener
    courseEl.addEventListener("click", () => {
        const courseid = courseEl.dataset.id;
        window.location.href = `./courses2.html/review/${courseid}`;
    });

    // Append the course element to the container
    coursesContainer.appendChild(courseEl);
}
