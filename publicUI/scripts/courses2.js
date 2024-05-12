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
    getAuth, limit
} from "./firebaseconfig.js";





// initilize the references to our collections in the database 
const usersRef = collection(db, "users");
const conversationsRef = collection(db, "conversations");
const coursesRef = collection(db, "courses");
const recsRef = collection(db, "recommended_courses");

// the html container which will contain each course container
const coursesContainer = document.querySelector('.courses-container');



// the current user singed in, its null untill its verified 
let currUser = null;



// this function checks if the user is singed in, if yes, return the user in the function argument 
onAuthStateChanged(auth, (user) => {

    // the current user now verified, retrieve it from the auth object. 
    currUser = auth.currentUser;

    console.log("the user rn is ", currUser);



    // if the user exists, call the main features function 
    if (user) {
        console.log("User is logged in:", user);        
        fetchCourses(); 
        fetchRecs(); 
    }
});




// this function will fetch the courses from the database 
function fetchCourses() {

    // onsnapshot on the course collection to retrieve the documents
    onSnapshot(coursesRef, snap => {

        // empty the courses conainer 
        coursesContainer.innerHTML = ''; 

        // the documents retrieved and its in the docs array. loop over it and create an html element on every item 
        snap.docs.forEach(doc => {
            
            // the doc here is the course document, create an html element based on it by calling this function
            createCourseHTML(doc)            
        })
    })
}
async function createCourseHTML(doc) {


    // doc.data() will retrieve the fields of the document
    const courseData = doc.data(); 

    // each course will have the id of the user that created it 
    const userID = courseData.userUid; 
    

    // query from the database the user that created this specific course, we can do it because we already got the id of that user from above 
    const q = query(usersRef, where("uid", "==", userID), limit(200)) // the limit function will make sure there will be no more than 200 reading from the db
    const usersDocs = await getDocs(q);  // based on the query, get all the documents which is stored in an array
    const userDoc = usersDocs.docs[0];  // get the first element in the array which will be the user 
    const userData = userDoc.data(); // get that user fields 


    // query from the database the user that currently signed in  
    const q2 = query(usersRef, where("uid", "==", currUser.uid), limit(200))
    const currUsersDocs = await getDocs(q2); 
    const currUserDoc = currUsersDocs.docs[0]; 
    const currUserData = currUserDoc.data(); 



    // ** CREATING THE HTML ELEMENT TO APPEND IT IN THE HTML FILE ** // 


    const courseEl = document.createElement('div'); // create html elemetn of tag 'div' 
    courseEl.classList.add('course'); // adding a class to the element for styling reasons 
    courseEl.dataset.id = doc.id;  

    // now we insert the actual html text to the element 
    courseEl.innerHTML = `
        <div class="course-author">
        ${userData.name}
        <div class="dropdown">
                <button class="dropbtn">
                    <img src="../images/icons8-info-50.png" alt="Info"/>
                </button>
                <div class="dropdown-content" id="myDropdown">
                    <a href="#" class="red" id="deleteCrs">Delete the course</a>
                </div>
            </div>
        </div>
        
        <div class="course-title">${courseData['crs-name']}</div>
        <div class="course-details">
            <div class="course-students"></div>
        </div>
    `;


    
    // if the owner of the coure is an admin, or the current user then let them have the privilage to delete the course 
    if(!((userData.uid === currUser.uid) || (currUserData.type === 'admin'))) {
        courseEl.querySelector('.dropdown').style.display = 'none' 
    } 

    moreButtonFunctionality(courseEl)

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



function moreButtonFunctionality(courseHeader) {

    // function that allow the dropdown menu

    courseHeader.querySelector('.dropbtn').addEventListener('click', function(event) {
        event.stopPropagation();
        var dropdown = courseHeader.querySelector("#myDropdown");
        dropdown.classList.toggle("show");
    });

    // const closeMsgEl = document.getElementById("closeMessage")
    const dltCrsEl = courseHeader.querySelector("#deleteCrs")

    
    dltCrsEl.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteCrs(courseHeader); 
    })

    // closeMsgEl.addEventListener("click", () => {
    //     // closeMsg(); 
    // })
}


async function deleteCrs(courseEl) {

    
    const crsId = courseEl.dataset.id; 
    const docRef = doc(db, "courses", crsId);
     await deleteDoc(docRef);


    
}



document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('toggle');
    const clipCourses = document.querySelector('.courses-container');
    const recommendedCourses = document.querySelector('.recs-container-recs');

    toggle.addEventListener('change', function() {
        if (this.checked) {
            console.log("Switched to Recommended courses");
            recommendedCourses.style.display = 'block'; // Show recommended courses
            clipCourses.style.display = 'none';         // Hide CLIP courses
        } else {
            console.log("Switched to CLIP courses");
            recommendedCourses.style.display = 'none';  // Hide recommended courses
            clipCourses.style.display = 'block';        // Show CLIP courses
        }
    });
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