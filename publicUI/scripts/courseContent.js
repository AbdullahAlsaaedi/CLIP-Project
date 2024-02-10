
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
    getAuth, setDoc,
    getStorage, ref, uploadBytes, getDownloadURL, deleteObject, 
} from "./firebaseconfig.js";

import { v4 as uuidv4 } from 'https://cdn.skypack.dev/uuid';






const usersRef = collection(db, "users");
const courses = collection(db, "courses");

// for current courses
const courseID = getIDfromURL(); 
const currCourseDoc = doc(courses, courseID); 
const coursesVideos = collection(currCourseDoc, "videos");



const storage = getStorage(); 


let currUser = null;

onAuthStateChanged(auth, (user) => {
    currUser = auth.currentUser;

    console.log("the user rn is ", currUser);

    if (user) {
        console.log("User is logged in:", user);

        // functions ..

        

    }
});



const fileInput = document.getElementById('videoUpload');
const videoPlayer = document.getElementById('uploadedVideo');
const videoPlaceholder = document.querySelector('.video-placeholder');


fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (!file) {
        console.log("No file selected.");
        return;
    }

    const videoURL = URL.createObjectURL(file);

    console.log(videoURL);
    console.log(videoPlayer);
    
    

    // Set the video source and show the video player
    videoPlayer.src = videoURL;
    videoPlayer.hidden = false;

    // Hide or remove the placeholder
    videoPlaceholder.style.display = 'none';

    console.log("File selected:", file);
    

    insertVid(file);
});

function insertVid(file) {

    const id = uuidv4();
    const vidsRef = ref(storage, `coursesVids/${id}`)
    console.log(vidsRef);
    const uploadTask = uploadBytes(vidsRef, file); 

    // uploadTask.then((snapshot) => {
    //     addDoc(coursesVideos, {
    //         date: serverTimestamp(),
    //     }).then(doc => {
    //         setDoc(doc, )
    //     })
    // })

    uploadTask.then((snapshot) => {
        const vidRef = doc(coursesVideos, id)
        setDoc(vidRef, {date: serverTimestamp()})
    })


    
}



function fetchVids() {

    // fetch the database, 
    onSnapshot(coursesVideos, snapshot => {
        document.querySelector('.course-sidebar').innerHTML = ""
        snapshot.docs.forEach(async doc => {
            console.log(doc.data());

            // based on id, fetch the storage, get the url that matches the id. 
            const id = doc.id; 

            const url = await getDownloadURL(ref(storage, `coursesVids/${id}`)); 

            console.log(url);
            
            createVideosHTML(doc, url) 

            
        })
    })
}

fetchVids()


function createVideosHTML(doc, url) {
    /* 
    <div class="lesson">
                    <div class="lesson-title">Step 1: lorem</div>
                    <div class="lesson-duration">1hr:30m</div>
                </div>

    */ 

    const lessonEl = document.createElement('div');
    lessonEl.classList.add('lesson')
    lessonEl.dataset.url = url; 
    lessonEl.innerHTML = 
    `<div class="lesson-title">Step 1: lorem</div>
    <div class="lesson-duration">1hr:30m</div>
     `

     lessonEl.addEventListener('click', () => {
        console.log(lessonEl.dataset.url);

        videoPlayer.src = lessonEl.dataset.url;
        videoPlayer.hidden = false;

     }) 

     document.querySelector('.course-sidebar').appendChild(lessonEl)


}

function getIDfromURL() {
    const url = window.location.href;
    const parts = url.split("/");
    const lastRoute = parts.pop();
    return lastRoute; 
}


// getDownloadURL(ref(storage, 'coursesVids/')).then(url => {
//     console.log(url);
    
// })

// const unId = push(db).key; 

// console.log(unId);



