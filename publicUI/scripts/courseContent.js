
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

function init() {
    // check if the database if not empty:
        // then the first item inside the sidebar will be the active one
            // video player source url => 1st doc url 
            console.log('inside init');
            
            onSnapshot(coursesVideos, async snap => {
                if(snap.docs.length === 0) {
                    showPlaceholders(); 
                    return; 
                }
                
                const doc = snap.docs[0];
                const url = await getDownloadURL(ref(storage, `coursesVids/${doc.id}`)); 

                videoPlayer.src = url;
                videoPlayer.hidden = false;
                videoPlaceholder.style.display = 'none';


                console.log(url);
            })
}

init(); 

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

function addLesson() {

    const title = document.querySelector('#lsn-title'); 
    const details = document.querySelector('#lsn-details'); 
    const videoInp = document.querySelector('#lsn-video'); 

    videoInp.addEventListener('change', function(event) { 

        const file = event.target.files[0];

        if (!file) {
            console.log("No file selected.");
            return;
        }

        const videoURL = URL.createObjectURL(file);

        console.log(videoURL);

        insertVid(file, title.value, details.value);


    })



}

addLesson();

function insertVid(file, title, details) {

    const id = uuidv4();
    const vidsRef = ref(storage, `coursesVids/${id}`)
    console.log(vidsRef);
    const uploadTask = uploadBytes(vidsRef, file); 

    uploadTask.then((snapshot) => {
        const vidRef = doc(coursesVideos, id)
        setDoc(vidRef, {title: title, details: details, date: serverTimestamp()})
    })
    
}



function fetchVids() {

    // fetch the database, 
    onSnapshot(coursesVideos, snapshot => {
        document.querySelector('.sidebar-lessons').innerHTML = "" 
        snapshot.docs.forEach(async doc => {
            // console.log(doc.data());

            // based on id, fetch the storage, get the url that matches the id. 
            const id = doc.id; 

            const url = await getDownloadURL(ref(storage, `coursesVids/${id}`)); 

            // console.log(url);
            
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
    `<div class="lesson-title">${doc.data().title}</div>
    <div class="lesson-duration">1hr:30m</div>
     `

     lessonEl.addEventListener('click', () => {
        console.log(lessonEl.dataset.url);

        videoPlayer.src = lessonEl.dataset.url;
        videoPlayer.hidden = false;
        makeActive(lessonEl)
     }) 

     document.querySelector('.sidebar-lessons').appendChild(lessonEl)


}

function makeActive(El) {

    
    const lessonsEls = document.querySelectorAll('.lesson');
    

    lessonsEls.forEach(lessonEl => lessonEl.classList.remove('playing'));

    El.classList.add('playing');


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




function showPlaceholders() {
    const title = document.querySelector('.empty-video-text')
    const input = document.querySelector('#videoUpload')
    const label = document.querySelector('.custom-file-upload')

    title.classList.remove('hidden')
    input.classList.remove('hidden')
    label.classList.remove('hidden')


}



const openBtn = document.querySelector(".open-modal-btn");
const modal = document.querySelector(".modal-overlay");
const closeBtn = document.querySelector(".close-modal-btn");
 
function openModal() {
    modal.classList.remove("hide");
}
 
function closeModal(e, clickedOutside) {
    if (clickedOutside) {
        if (e.target.classList.contains("modal-overlay"))
            modal.classList.add("hide");
    } else modal.classList.add("hide");
}
 
openBtn.addEventListener("click", openModal);
modal.addEventListener("click", (e) => closeModal(e, true));
closeBtn.addEventListener("click", closeModal);