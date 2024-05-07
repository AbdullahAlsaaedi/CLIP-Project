import {auth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "./firebaseconfig.js"
import {initializeApp, getFirestore, collection, getDocs, addDoc, deleteDoc, doc, onSnapshot,
  query, where, orderBy, serverTimestamp, getDoc, updateDoc, firebaseConfig, app, db, getAuth,
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject, 
} from "./firebaseconfig.js"



const signupForm  = document.querySelector('#signup-form');
const loginForm = document.querySelector('#login-form');

const singoutEl  = document.querySelector('.signout');
const signinEl = document.querySelector('.signin');
const profileLinkCon = document.querySelector('.profile-link-container'); 
const profileLink = document.querySelector('.profile-link'); 

const usersRef = collection(db, 'users');

const storage = getStorage(); 

onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is logged in:", user);
      signinEl.parentElement.style.display = 'none'
      singoutEl.classList.remove("hidden")


      const q = query(usersRef, where('uid', '==', user.uid));

      getDocs(q).then(async querySnapshot => {
        
            const user = querySnapshot.docs[0];
            profileLink.href = `/user/${user.id}`
            profileLinkCon.classList.remove('hidden');

            const imageRef = ref(storage, `profiles/${user.id}`);


            if(user.data().type === "admin") {

                const imageRef = ref(storage, `profiles/vampire.png`);
        
                getDownloadURL(imageRef)
                .then((url) => {
                    // `url` is the download URL for your file
                    console.log(url);
                    // You can use this URL to display the image or download it.
                    // For example, setting it as the source for an <img> element:
                    document.querySelector('.profile-pfp-img').src = url;
                })
                .catch((error) => {
                    // Handle any errors
                    console.error('Error downloading the image: ', error);
                });

                const url = await getDownloadURL(imageRef)
                profileLinkCon.querySelector('img').src = url; 
         
            } else if (user.data().type === "user") {
                
                    const imageRef = ref(storage, `profiles/${user.id}`);
            
                    getDownloadURL(imageRef)
                    .then((url) => {
                        // `url` is the download URL for your file
                        console.log(url);
                        // You can use this URL to display the image or download it.
                        // For example, setting it as the source for an <img> element:
                        document.querySelector('.profile-pfp-img').src = url;
                    })
                    .catch((error) => {
                        // Handle any errors
                        console.error('Error downloading the image: ', error);
                    });
    
                    const url = await getDownloadURL(imageRef)
                    profileLinkCon.querySelector('img').src = url; 
            
                
            }






            
        
        
      })



    } else {
      console.log("User is not logged in");
    }
  });

singoutEl.addEventListener("click", e => {
    e.preventDefault();

    singoutEl.classList.add("hidden")


    signOut(auth).then(() => {
        console.log('User signed out')
        window.location.href = '../html/signin.html';
    }).catch(err => console.log(err.message));
})

