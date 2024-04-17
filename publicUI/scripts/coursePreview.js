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
    getStorage, ref, getDownloadURL
} from "./firebaseconfig.js";


const enrollbtn = document.querySelector(".enrollbtn");
const numOfStudents = document.querySelector('.num-of-students');
const storage = getStorage();


const usersRef = collection(db, "users");



let currUser = null;
let overlay = document.querySelector(".modal-overlay");


onAuthStateChanged(auth, (user) => {
    currUser = auth.currentUser;

    if (user) {

        fetchLogo(user); 
        checkEnrollmentStatus(user); 

        enrollBtn.addEventListener("click", async function () {


                if(enrollBtn.textContent === "Click for enrollment!") {
                    enrollBtn.textContent = "You enrolled this course";
                    enrollBtn.style.backgroundColor = "orangered";
                } else {
                    enrollBtn.textContent === "You enrolled this course";
                    enrollBtn.textContent = "Click for enrollment!";
                    enrollBtn.style.backgroundColor = "rgb(80, 70, 227)";
                }
            

                console.log(user.uid);
                
            
                const currentUser = user;
            
                const usersRef = collection(db, 'users');
                const currentUserQ = query(usersRef, where('uid', '==', user.uid));
                const currentUserSnap = await getDocs(currentUserQ);
                const currentUserDoc = currentUserSnap.docs[0]; 

                console.log(currentUserDoc.id);
                
            
            
            
                let url = window.location.href; 
                let parts = url.split("/"); // Split the URL by "/"
                let courseId = parts[parts.length - 1]; // Get the last part of the array
            
                const userId = currentUserDoc.id; 
            
            
            
                try {
                    const courseRef = doc(db, 'courses', courseId);
                    const courseSnap = await getDoc(courseRef);
            
                    if (courseSnap.exists()) {
                        console.log("YES");
                        
                        const isEnrolled = courseSnap.data().enrolledStudents?.includes(userId);
                        
                        if (isEnrolled) {
                            // User is enrolled, so remove enrollment
                            await updateDoc(courseRef, {
                                enrolledStudents: arrayRemove(userId)
                            });
                            

                        } else {
                            // User is not enrolled, so enroll them
                            await updateDoc(courseRef, {
                                enrolledStudents: arrayUnion(userId)
                            });
                            
                        }

                        // numOfStudents.textContent = `${courseSnap.data().enrolledStudents.length.toString()} Students`;

                    } else {
                        console.error('Course not found.');
                    }
                } catch (error) {
                    console.error('Error toggling enrollment: ', error);
                }
            
        })
    }
});

// async function displayStudentsNumber(user) {


async function fetchLogo(user) {
    let url = window.location.href; 
    let parts = url.split("/"); // Split the URL by "/"
    let courseId = parts[parts.length - 1]; // Get the last part of the array

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    const courseData = courseSnap.data(); 


    const logoID = courseData.logoID;
    displayLogo(logoID);

}

function displayLogo(logoID) {

    // Create a reference to the file we want to download
    const imageRef = ref(storage, `courses/${logoID}`);
  
    // Get the download URL
    getDownloadURL(imageRef)
      .then((url) => {
        // Insert url into an <img> tag to "download"
        const img = document.querySelector('.course-logo');
        img.setAttribute('src', url);
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error fetching image:", error);
      });
}



async function checkEnrollmentStatus (user) {
            

    console.log(user.uid);
    

    const currentUser = user;

    const usersRef = collection(db, 'users');
    const currentUserQ = query(usersRef, where('uid', '==', user.uid));
    const currentUserSnap = await getDocs(currentUserQ);
    const currentUserDoc = currentUserSnap.docs[0]; 

    const imageRef = ref(storage, `profiles/${currentUserDoc.id}`);

    const pfpUrl = await getDownloadURL(imageRef)
    document.querySelector('.author-pfp').src = pfpUrl
    



    let url = window.location.href; 
    let parts = url.split("/"); // Split the URL by "/"
    let courseId = parts[parts.length - 1]; // Get the last part of the array

    const userId = currentUserDoc.id; 


    



    try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);


        onSnapshot(courseRef, (doc) => {
            const enrolledStudents = doc.data().enrolledStudents || [];
            numOfStudents.textContent = `${enrolledStudents.length.toString()} Students`
        });

        enrollBtn.style.opacity = "1";

        if (courseSnap.exists()) {
            console.log("YES");
            
            const isEnrolled = courseSnap.data().enrolledStudents?.includes(userId);
            
            if (isEnrolled) {
                enrollBtn.textContent = "You enrolled this course";
                enrollBtn.style.backgroundColor = "orangered";
            } else {
                enrollBtn.textContent = 'Click for enrollment!';
                enrollBtn.style.backgroundColor = "rgb(80, 70, 227)";
            }

            // numOfStudents.textContent = `${courseSnap.data().enrolledStudents.length.toString()} Students`;

        } else {
            console.error('Course not found.');
        }
    } catch (error) {
        console.error('Error toggling enrollment: ', error);
    }

};





enrollbtn.addEventListener("click", () => {
    let url = window.location.href; 
    let parts = url.split("/"); // Split the URL by "/"
    let lastPart = parts[parts.length - 1]; // Get the last part of the array
    console.log(lastPart);
    
    window.location.href = `/html/courses2.html/${lastPart}`
})

const enrollBtn = document.querySelector('.enroll-btn');

// Function to toggle enrollment status


