import {auth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile} from "./firebaseconfig.js"

import {initializeApp,
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
    getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "./firebaseconfig.js"

  

const signupForm  = document.querySelector('#signup-form');
signupForm.reset(); 

const storage = getStorage(); 



onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("User is logged in:", user);
      
      

    //   window.location.href = '../index.html';

    } else {
      console.log("User is not logged in");
    }
  });

signupForm.addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const username = signupForm.username.value;
    const email = signupForm.email.value;
    const password = signupForm.password.value;

    createUserWithEmailAndPassword(auth, email, password).then((cred) => {
        const user = cred.user; 
        console.log('User Created: ', user);

        updateProfile(user, {
            displayName: username, 
            photoURL: '../../images/photo-1631477076110-2b8c1fe0f3cc.avif'
        }).then(() => {
            const docRef = addDoc(collection(db, 'users'), {
                uid: user.uid, 
                name: user.displayName,
                email: user.email,
            }).then((doc) => {
                console.log("Auth changed, ", user.displayName);
                console.log(docRef);
    
                
                infoFormFun(doc, signupForm);
            })

            
    

            


            // setTimeout(() => {
            //     window.location.href = `/users/${user.uid}`;
            // }, 1000)
            
        })


      
        
      
        
        
    }).catch(err => console.log(err.message))
})


document.getElementById('profile-pic-container').addEventListener('click', function() {
    document.getElementById('pfp').click();
});


document.getElementById('pfp').addEventListener('change', function(event) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('profile-pic-preview');
        const uploadImgText = document.querySelector('.upload-img');
        const uploadText = document.querySelector('.upload-text');

        const picContainer = document.querySelector('.profile-pic-container');

        preview.src = e.target.result;
        preview.style.display = 'block'; // Show the preview
        uploadImgText.style.display = "none";
        uploadText.style.display = "none";
        };
    reader.readAsDataURL(event.target.files[0]);
});

const signupInfoBtn = document.querySelector('.signup-info-btn'); 
const infoForm = document.getElementById('profile-info-form');

function infoFormFun(doc, form) { 

    
        const signBtn = document.querySelector('.signup-info-btn');
        const signBtnText = document.querySelector('.signup-info-btn-text');
        const loadingIcon = document.querySelector('.icon');


        signBtn.style.backgroundColor = "#fff"; 
        signBtn.style.boxShadow = "none"; 
    
        signBtnText.textContent = "please wait to process your information..."
        signBtnText.style.color = "black"
    
        loadingIcon.style.display = "inline-block"
        signBtn.disabled = true;
        signBtn.style.cursor = 'default';
    
        // insert profile and the bio to the firebase.
        // const userRef = doc(db, 'users', user.uid);


        const file = form.pfp.files[0];

        const pfpRef = ref(storage, `profiles/${doc.id}`)
        const uploadTask = uploadBytes(pfpRef, file); 

        // uploadTask.then((snapshot) => {
        //     const pfpRef = doc(coursesVideos, id)

        //     setDoc(pfpRef, {title: title, details: details, date: serverTimestamp()})
        // })



        
        updateDoc(doc, {
            bio: form.bio.value,
            pfp: form.pfp.value
        }).then(() => {
            console.log("User details updated successfully");

            setTimeout(() => {
                loadingIcon.src = '../images/icons8-checkmark-64.png'
                signBtnText.textContent = "Your account is created!"
    
                const gotoProfile = document.querySelector(".goto-profile");
                const gotoHomepage = document.querySelector(".goto-homepage");
    
                gotoProfile.style.display = "flex"; 
                gotoProfile.href = `/../user/${doc.id}`
                gotoHomepage.style.display = "block"; 

            }, 1500)
            
            
            


        }).catch((error) => {
            console.error("Error updating user details:", error);
        });


  
    
    
}



document.querySelector('.continue-btn').addEventListener('click', () => {
    const infoForm = document.getElementById("profile-info-form");


            const email = document.getElementById('email')
            const username = document.getElementById('username')
            const password = document.getElementById('password')

            if(!email.value || !username.value || !password.value) {
                console.log(email.value, username.value, password.value);
                
                console.log("Please fill out the fields!");
                return; 
            }  else {
                const credForm = document.getElementById('profile-cred-form') ;
                const googleBtn = document.querySelector('.goolge-signup-btn'); 
                const signupBtn = document.querySelector('.signup-btn'); 
                const divider = document.querySelector('.divider'); 
                const signMakeAcc = document.querySelector('.signup-makeAcc'); 
                const signHeading = document.querySelector('.signup-heading'); 
                
                infoForm.style.display = "flex"; 
                credForm.style.display = "none"; 
                
                googleBtn.style.display = "none"; 
                divider.style.display = "none"; 
                signMakeAcc.style.display = "none"; 
                signHeading.style.display = "none"; 
            }

            
})

// signupInfoBtn.addEventListener("click", {

// })



// console.log("Hey");


