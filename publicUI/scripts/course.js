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
    getStorage, ref, uploadBytes, getDownloadURL, deleteObject, increment, arrayUnion, arrayRemove
} from "./firebaseconfig.js";


import { v4 as uuidv4 } from 'https://cdn.skypack.dev/uuid';


const signupForm = document.querySelector("#signup-form");
const loginForm = document.querySelector("#login-form");

const singoutEl = document.querySelector(".signout");
const signinEl = document.querySelector(".signin");

const storage = getStorage(); 

// const commentBtnEl = document.querySelector('.commentBtn');
// const commentInEl = document.querySelector('.commentIn');

const postsRef = collection(db, "posts");
const usersRef = collection(db, "users");
const commentsRef = collection(db, "comments");
const likesRef = collection(db, "likes");


let overlay = document.querySelector(".modal-overlay");

let currentURL = window.location.href;
let currentPageName = currentURL.substr(currentURL.lastIndexOf("/") + 1);
currentPageName = currentPageName.substr(0, currentPageName.lastIndexOf("."));

console.log(currentPageName);

// const user = getAuth(auth).currentUser;

let currUser = null;

onAuthStateChanged(auth, async (user) => {
    currUser = auth.currentUser;

    // currUser.photoURL = '../images/photo-1631477076110-2b8c1fe0f3cc.avif'
    console.log("the user rn is ", currUser);

    if (user) {
        console.log("User is logged in:", user);

        signinEl.parentElement.style.display = "none";

        const postForm = document.querySelector(".post-form");
        const posts = document.querySelector(".posts");




        formModal(); 
        visualFromSubmission(); 



        // 1 ----- CLICKED  THE BUTTON


        postForm.addEventListener("submit", async function (e) {
            
            if (postForm.postTitle.value === "") return false;
            e.preventDefault();

            const modal = document.querySelector('.form-modal');
            modal.style.display = "none";

            const postRef = await addDoc(postsRef, {
                userID: currUser.uid,
                title: postForm.postTitle.value,
                content: postForm.postContent.value,
                // check this later
                course: currentPageName,
                type: 'text',
                likes: 0, 
                userLikes: arrayUnion()

            });
            // console.log(postForm.postTitle);
            postForm.reset();
            console.log("=================", postRef.id);


            const likeDoc = doc(db, "likes", postRef.id);
            
            await setDoc(likeDoc, {
                likes: 0
              });




        });



        // 2 ------ FETCH THE DAT 

        const postQuery = query(
            postsRef,
            where("course", "==", currentPageName)
        );


        const q = query(usersRef, where('uid', "==", currUser.uid));
        const querySnapshot = await getDocs(q);
        const currUserDoc = await querySnapshot.docs[0];




        

        onSnapshot(postQuery, (snapshot) => {
            posts.innerHTML = "";

            let postsArr = [];

            snapshot.docs.forEach((el) =>
                postsArr.push({ ...el.data(), id: el.id })
            );

            postsArr.forEach((el) => {
                let userDoc;

                const posterQuery = query(
                    usersRef,
                    where("uid", "==", el.userID)
                );

                onSnapshot(posterQuery, (snapshot) => {
                    snapshot.forEach(async (doc) => {
                        
                        const post = await createPost3(el, doc.data(), doc.id, currUserDoc) 
                        
                        const tmpPost = document.getElementById(post.id);
                        posts.appendChild(post);

                        // -------------- COMMENTS FETCHING ----------- //
                    
                        const commentsQuery = query(
                            commentsRef,
                            where("postId", "==", el.id), where("parentCommentID", "==", null)
                        );

                        onSnapshot(commentsQuery, (snapshot) => {
                            post.querySelector(".comments").innerHTML = "";

                            snapshot.forEach(async (doc) => {
                                let commentEl = await createComment3(post, doc, el, currUserDoc);


                                // fetch the replies to the comment 

                                const commentRepliesQuery = query(
                                    commentsRef,
                                    where("parentCommentID", "==", doc.id)
                                );

                                onSnapshot(commentRepliesQuery, (snapshot) => {
                                    commentEl.querySelector('.replies').innerHTML = ''

                                    snapshot.forEach(async doc => {
                                        console.log(doc.data());
                                        
                                        await createReply(commentEl, doc, currUserDoc)
                                    })
                                })



                            });

                            




                        });
                    });
                });
            });
        });
    }
});

singoutEl.addEventListener("click", (e) => {
    e.preventDefault();

    signOut(auth)
        .then(() => {
            console.log("User signed out");
            window.location.href = "../index.html";
        })
        .catch((err) => console.log(err.message));
});

// function

async function createPost3(postDoc, userDoc, userID, currUserDoc) {
    // console.log("POST CREATED");

    // get user associated with the post

    // const userID = postDoc.userID;

    let posts = document.querySelector(".posts");

    let postEl = document.createElement("div");
    postEl.classList.add("post");
    postEl.id = postDoc.id;


    const imageRef = ref(storage, `profiles/${userDoc.type === 'admin' ? 'vampire.png' : userID}`);

    const url = await getDownloadURL(imageRef)



    if(postDoc.type === "text") {

        postEl.innerHTML = `
    

        


        <div class="post-details">


        <div class="post-heading-details"> 

            <div class="pfp-container">
                <img src="${url}" class="pfp" alt="img">
            </div>

            <div class="post-username">
                ${userDoc.name}

               
            </div>

            ${((userDoc.uid === currUser.uid) || (currUserDoc.data().type === "admin")) ? '<button class="post-delete">X</button>' : ""}

        
        </div>

        

       

            <h3 class="title">${postDoc.title}</h3>

            <h4 class="content">
                
                ${postDoc.content}
            </h4>

            <div class="post-details-user">

            
                <div class="votes">
                    <div class="like-container">
                    
                        <img src="../images/heart-svgrepo-com.svg" alt="" class="like-svg">
                        <div class="likes-num"> likes</div> 

                        
                    </div>
    
    
                    <div class="comment-container">
                        <img src="../images/comment.svg" alt="" class="comment-svg">
                        <div class="comments-num"> 0 comments </div> 

                    </div>
                </div>

                <button class="post-readbtn primary-btn">Read more</button>


            </div>
        </div>
        

        <div class="post-modal hidden">
            <button class="modal-close">X</button>

            <h3 class="title">${postDoc.title}</h3>

            <p>${postDoc.content}</p>
            <textarea class="commentIn" type="text" placeholder="Add a comment"></textarea>
            <button class="commentBtn"> add comment </button>

            <div class="comments">
                <div class="comment">
                    logo
                    <div class="p">conent</div>
                </div>

                <div class="comment">
                    logo
                    <div class="p">conent</div>
                </div>

                <div class="comment">
                    logo
                    <div class="p">conent</div>
                </div>

            <!-- end of comments -->  
            </div>

        <!-- end of modal -->  
        </div>



    


    <!-- end of post-->



`;



    } else if (postDoc.type === "image") {

        postEl.innerHTML = `
    

        


        <div class="post-details">


        <div class="post-heading-details"> 

            <div class="pfp-container">
                <img src="${url}" class="pfp" alt="img">
            </div>

            <div class="post-username">
                ${userDoc.name}

                
            </div>

            <button class="post-delete">X</button>

        
        </div>

        

       

            <h3 class="title">${postDoc.title}</h3>

            <h4 class="content">
                
            <img src="${postDoc.content}" />
            </h4>

            <div class="post-details-user">

            
                <div class="votes">
                    <div class="like-container">
                        <img src="../images/heart-svgrepo-com.svg" alt="" class="like-svg">
                        <div class="likes-num"> likes</div> 

                    </div>
    
    
                    <div class="comment-container">
                        <img src="../images/comment.svg" alt="" class="comment-svg">
                        <div class="comments-num"> comments </div> 

                    </div>
                </div>

                <button class="post-readbtn primary-btn">Read more</button>


            </div>
        </div>
        

        <div class="post-modal hidden">
            <button class="modal-close">X</button>

            <h3 class="title">${postDoc.title}</h3>

            <p>             <img src="${url}"/>
                </p>




            <textarea class="commentIn" type="text" placeholder="Add a comment"></textarea>
            <button class="commentBtn"> add comment </button>

            <div class="comments">
                <div class="comment">
                    logo
                    <div class="p">conent</div>
                </div>

                <div class="comment">
                    logo
                    <div class="p">conent</div>
                </div>

                <div class="comment">
                    logo
                    <div class="p">conent</div>
                </div>

            <!-- end of comments -->  
            </div>

        <!-- end of modal -->  
        </div>



    


    <!-- end of post-->



`;


    }


    const commentsBtn = postEl.querySelector('.comments-num'); 

   



     
    const likeDoc = doc(db, 'likes', postDoc.id); 

    


    onSnapshot(likeDoc, (documentSnapshot) => {
        console.log(documentSnapshot);
        
        const likesData = documentSnapshot.data(); 

        postEl.querySelector('.likes-num').textContent = `${likesData.likes} likes`


    })

    const q = query(commentsRef, where('postId', '==', postDoc.id))

    onSnapshot(q, (documentSnapshot) => {
        const length = documentSnapshot.docs.length; 
        console.log('Number of comments:', length);

        postEl.querySelector('.comments-num').textContent = `${length} comments`


        
    })
    

    async function checkInitialLikeStatus(postId, userId, postEl) {
        const likeRef = doc(db, "likes", postId);
        const docSnap = await getDoc(likeRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const userLikes = data.userLikes || [];
            updateHeartIcon(userLikes.includes(userId), postEl);
        } else {
            updateHeartIcon(false, postEl); // No likes yet, show unfilled heart
        }
    }
    
    // Example of how you might call this when setting up each post element
    checkInitialLikeStatus(postDoc.id, currUser.uid, postEl);



    // onSnapshot()

    postEl.querySelector('.like-svg').addEventListener("click", () => {
        console.log("Like toggled!");
        toggleLike(postDoc.id, currUser.uid, postEl); // Assuming currentUser.id holds the logged-in user's ID
        // postEl.querySelector('.like-svg').src = '/../images/heart-svgrepo-com(2).svg'; 
        
    });
    

    // document.querySelector('.likes-svg').addEventListener("click", () => {
    //     console.log("LIKED");
        
    // })
    




    // ADDING A COMMENT -----------------------------------


    let button = postEl.querySelector(".commentBtn");
    let input = postEl.querySelector(".commentIn");

    button.addEventListener("click", (e) => {
        e.preventDefault();
        const postId = postDoc.id;
        const commentContent = input.value;

        // add comment to databse

        addDoc(commentsRef, {
            postId: postId,
            content: commentContent,
            parentCommentID: null, 
            userID: currUser.uid
        });
    });

    const postReadEl = postEl.querySelector(".post-readbtn");
    const modalElement = postEl.querySelector(".post-modal");
    const postDeleteEl = postEl.querySelector(".post-delete")

    if(postDeleteEl) {
        postDeleteEl.addEventListener("click", () => {
        
            console.log(postDoc.id);
    
            // postsRef.doc(postDoc.id).delete().then(() => {
            //     console.log("Successfuly delete");
                
            // })
    
    
            const docRef = doc(db, "posts", postDoc.id);
    
            console.log(docRef);
            
            deleteDoc(docRef); 
            
            
        })
    }

    

    postReadEl.addEventListener("click", () => {
        {
            // Display the corresponding modal using the index

            console.log("Hey");

            let currModal = modalElement;
            modalElement.classList.remove("hidden");
            overlay.classList.remove("hidden");

            document.body.classList.add("no-scroll");

            let closeBtn = modalElement.querySelector(".modal-close");

            closeBtn.addEventListener("click", () => {
                modalElement.classList.add("hidden");
                document.body.classList.remove("no-scroll");
                overlay.classList.add("hidden");
            });

            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    currModal.classList.add("hidden");
                    document.body.classList.remove("no-scroll"); // Remove the class to enable scrolling
                    overlay.classList.add("hidden");
                }
            });

            overlay.addEventListener("click", () => {
                currModal.classList.add("hidden");
                document.body.classList.remove("no-scroll"); // Remove the class to enable scrolling
                overlay.classList.add("hidden");
            });
        }
    });

    commentsBtn.addEventListener('click', () => {
        console.log("Hey");

            let currModal = modalElement;
            modalElement.classList.remove("hidden");
            overlay.classList.remove("hidden");

            document.body.classList.add("no-scroll");

            let closeBtn = modalElement.querySelector(".modal-close");

            closeBtn.addEventListener("click", () => {
                modalElement.classList.add("hidden");
                document.body.classList.remove("no-scroll");
                overlay.classList.add("hidden");
            });

            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    currModal.classList.add("hidden");
                    document.body.classList.remove("no-scroll"); // Remove the class to enable scrolling
                    overlay.classList.add("hidden");
                }
            });

            overlay.addEventListener("click", () => {
                currModal.classList.add("hidden");
                document.body.classList.remove("no-scroll"); // Remove the class to enable scrolling
                overlay.classList.add("hidden");
            });
    })

    return postEl;
}













// console.log(createPost3());

async function createComment3(postEl, commentDoc, postDoc, currUserDoc) {
    let comments = postEl.querySelector(".comments");
    let newCommentEl = document.createElement("div");
    let commentData = commentDoc.data(); 
    newCommentEl.classList.add("comment");

    newCommentEl.dataset.id = commentDoc.id; 
    

    // // fetch based on the userID of the comment. 
    const userID = commentDoc.data().userID; 

    const q = query(usersRef, where('uid', '==', userID)); 

    const usersDocs = await getDocs(q); 
    const user = usersDocs.docs[0];
    const userData = user.data(); 
    
    console.log('the user is ', user)

    
    const imageRef = ref(storage, `profiles/${userData.type === "admin" ? 'vampire.png'  : user.id}`);

    const url = await getDownloadURL(imageRef)

    newCommentEl.innerHTML = `    
        <div class="reply-details">


        <div class="post-heading-details"> 

            <div class="pfp-container">
                <img src="${url}" class="pfp" alt="img">
            </div>

            <div class="post-username">
                ${userData.name}

                
            </div>

            ${((userData.uid === currUser.uid) || (currUserDoc.data().type === "admin")) ? '<button class="post-delete">X</button>' : ""}


        
        </div>

        

       

            <h3 class="title">${commentDoc.data().content}</h3>

            <div class="reply-details-user">

            
                <div class="votes">

                        <div class="like-container">
                            
                        <img src="../images/heart-svgrepo-com.svg" alt="" class="like-svg">
                        <div class="likes-num"> likes</div> 


                        <buton class="comment-reply">Reply</button>

                        
                </div>


                    
                    
                </div>

                <div class="input-wrapper2">
                    <input placeholder="Reply…" class="reply-inp" type="text"/>
                    <button class="reply-btn primary-btn">Reply</button>
                </div>


            </div>
        </div>

        <div class="replies"></div>
    `;



    const replyOnCmnt = newCommentEl.querySelector('.comment-reply'); 
    replyOnCmnt.addEventListener("click", () => {
        
        const inputsWrapper = newCommentEl.querySelector('.input-wrapper2'); 
        inputsWrapper.style.display = 'inline-block'
        
        
    })


    console.log(commentDoc.id);


    const postDeleteEl = newCommentEl.querySelector(".post-delete")

    if(postDeleteEl) {
        postDeleteEl.addEventListener("click", () => {
        
            console.log(postDoc.id);
    
            // postsRef.doc(postDoc.id).delete().then(() => {
            //     console.log("Successfuly delete");
                
            // })
    
    
            const docRef = doc(db, "comments", commentDoc.id);
    
            console.log(docRef);
            
            deleteDoc(docRef); 
            
            
        })
    }


    
    


    replies(newCommentEl, commentDoc, postDoc); 

    comments.appendChild(newCommentEl);

    return newCommentEl;
}

function replies(commentEl, commentDoc, postDoc) {

    const replyInpEl = commentEl.querySelector('.reply-inp')
    const replyBtnEl = commentEl.querySelector('.reply-btn')


    replyBtnEl.addEventListener('click', (e) => {
        console.log(replyInpEl.value);
        console.log(commentDoc.id);
        
        const commentId = commentDoc.id; 
        const postId = postDoc.id; 
        const commentContent = replyInpEl.value; 

        e.preventDefault();
    

        // add comment to databse

        addDoc(commentsRef, {
            postId: postId,
            content: commentContent,
            parentCommentID: commentId,
            userID: currUser.uid
        });
        
    })
    


} 

async function createReply(commentEl, commentDoc, currUserDoc) {
    let newReply = document.createElement("div");
    let repliesDiv = commentEl.querySelector('.replies')



    // // fetch based on the userID of the comment. 
    const userID = commentDoc.data().userID; 

    const q = query(usersRef, where('uid', '==', userID)); 

    const usersDocs = await getDocs(q); 
    const user = usersDocs.docs[0];
    const userData = user.data(); 
    
    console.log('the user is ', user)

    
    const imageRef = ref(storage, `profiles/${userData.type === "admin" ? 'vampire.png'  : user.id}`);


    const url = await getDownloadURL(imageRef)



    newReply.innerHTML = `

        <div class="reply-details">


        <div class="post-heading-details"> 

            <div class="pfp-container">
                <img src="${url}" class="pfp" alt="img">
            </div>

            <div class="post-username">
                ${userData.name}

                <div class="post-date">
                    2 days ago
                </div>
            </div>

            ${((userData.uid === currUser.uid) || (currUserDoc.data().type === "admin")) ? '<button class="post-delete">X</button>' : ""}

        
        </div>

        

       

            <h3 class="title">${commentDoc.data().content}</h3>

            <div class="reply-details-user">

            
                <div class="votes">
                <div class="like-container">
                            
                <img src="../images/heart-svgrepo-com.svg" alt="" class="like-svg">
                <div class="likes-num"> likes</div> 
                </div>


            </div>
        </div>
    
    `;


    const postDeleteEl = newReply.querySelector(".post-delete")

    if(postDeleteEl) {
        postDeleteEl.addEventListener("click", () => {
        
    
            // postsRef.doc(postDoc.id).delete().then(() => {
            //     console.log("Successfuly delete");
                
            // })
    
    
            const docRef = doc(db, "comments", commentDoc.id);
    
            console.log(docRef);
            
            deleteDoc(docRef); 
            
            
        })
    }


    repliesDiv.appendChild(newReply)
}

function showModal(modalElement) {
    console.log("Hey");

    let currModal = modalElement;

    modalElement.classList.remove("hidden");
    document.body.classList.add("no-scroll");

    let closeBtn = modalElement.querySelector(".modal-close");

    closeBtn.addEventListener("click", () => {
        modalElement.classList.add("hidden");
        document.body.classList.remove("no-scroll");
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            currModal.classList.add("hidden");
            document.body.classList.remove("no-scroll"); // Remove the class to enable scrolling
        }
    });

    console.log(modalElements[index]);
}


const fileInput = document.querySelector('#fileInput');
const uploadBtn = document.querySelector('#uploadBtn');
const imagePreview = document.querySelector('.imagePreview');


function formModal() {
    // Get the modal
    const modal = document.querySelector('.form-modal');

    // Get the button that opens the modal
    const btn = document.querySelector('.create-post-btn');

    // Get the <span> element that closes the modal
    const span = document.querySelector(".close-form-modal");

    // When the user clicks the button, open the modal 
    btn.addEventListener('click', () => {
    modal.style.display = "block";
    });

    // When the user clicks on <span> (x), close the modal
    span.addEventListener('click', () => {
    modal.style.display = "none";

    document.querySelector(".post-types").style.display = "flex"; 
    document.querySelector(".post-form").style.display = "none"; 


    fileInput.value = "";
    // Hide the image preview
    imagePreview.src = "";
    // imagePreview.classList.add("hidden")
    document.querySelector(".visual-form").style.display = "none"; 
    imagePreview.classList.add("hidden");

    });

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = "none";

        document.querySelector(".post-types").style.display = "flex"; 
        document.querySelector(".post-form").style.display = "none"; 

    }
    });

}



const postType = document.querySelectorAll(".post-type"); 
const modelContent = document.querySelector('.form-modal-content');

postType.forEach((elem) => {
    elem.addEventListener("click", () => {
        
        if(elem.classList.contains("text-type")) {
            document.querySelector(".post-types").style.display = "none"; 
            document.querySelector(".post-form").style.display = "flex"; 
        } else if (elem.classList.contains("visual-type")) {
            document.querySelector(".post-types").style.display = "none"; 
            document.querySelector(".visual-form").style.display = "flex"; 
            uploadBtn.style.display = 'initial'
        }
        else if (elem.classList.contains("file-type")) {
            document.querySelector(".post-types").style.display = "none"; 
            document.querySelector(".file-type").style.display = "flex"; 
            uploadBtn.style.display = 'initial'
        }
        
        
    })
    
})





    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove("hidden")
                uploadBtn.style.display = 'none'
                
                        };

                        setTimeout(() => {
                            modelContent.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100)

            reader.readAsDataURL(file);
        }
    });

document.getElementById('uploadBtn').addEventListener('click', function() {
    document.getElementById('fileInput').click()
});




function visualFromSubmission() {
    const visualForm = document.querySelector(".visual-form") 
    visualForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector(".form-modal").style.display = "none"


        const fileInput = document.getElementById('fileInput'); 

        const file = fileInput.files[0];

        if (file) {
            console.log(file); // Log the File object to the console

            // Example of accessing properties of the File object
            console.log(`File Name: ${file.name}`);
            console.log(`File Type: ${file.type}`);
            console.log(`File Size: ${file.size} bytes`);
        }

        const id = uuidv4();
        const fileRef = ref(storage, `images/${id}`)
        const uploadImage = uploadBytes(fileRef, file); 


        uploadImage.then(async (snapshot) => {
            
            const url = await getDownloadURL(ref(storage, `images/${id}`)); 
            
            addDoc(postsRef, {
                content: url, 
                type: "image", 
                course: currentPageName,
                userID: currUser.uid, 
                title: visualForm.postTitle.value
            })

        })

        // console.log();
        
        // const fileUrl = await fileRef.getDownloadURL();


        // console.log(fileUrl);
        
        
        
    })
}



async function toggleLike(postId, userId, postEl) {
    const likeRef = doc(db, "likes", postId);
    const docSnap = await getDoc(likeRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const userLikes = data.userLikes || [];
        const isLiked = userLikes.includes(userId);

        if (!isLiked) { // User has not liked, like the post
            updateHeartIcon(true, postEl);

            await updateDoc(likeRef, {
                likes: increment(1),
                userLikes: arrayUnion(userId)
            });
            console.log("Liked successfully");
        } else { // User has liked, unlike the post
            updateHeartIcon(false, postEl);

            await updateDoc(likeRef, {
                likes: increment(-1),
                userLikes: arrayRemove(userId)
            });
            console.log("Unliked successfully");
        }
    } else {
        // Document does not exist, create it with the first like
        updateHeartIcon(true, postEl);

        await setDoc(likeRef, {
            likes: 1,
            userLikes: [userId]
        });
        console.log("First like added");
    }
}


function updateHeartIcon(isLiked, postEl) {
    const svgSource = isLiked ? '../images/heart-svgrepo-com(2).svg' : '../images/heart-svgrepo-com.svg';
    postEl.querySelector('.like-svg').src = svgSource;
}


