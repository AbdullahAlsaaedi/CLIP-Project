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

const signupForm = document.querySelector("#signup-form");
const loginForm = document.querySelector("#login-form");

const singoutEl = document.querySelector(".signout");
const signinEl = document.querySelector(".signin");
// const commentBtnEl = document.querySelector('.commentBtn');
// const commentInEl = document.querySelector('.commentIn');

const postsRef = collection(db, "posts");
const usersRef = collection(db, "users");
const commentsRef = collection(db, "comments");

let overlay = document.querySelector(".modal-overlay");

let currentURL = window.location.href;
let currentPageName = currentURL.substr(currentURL.lastIndexOf("/") + 1);
currentPageName = currentPageName.substr(0, currentPageName.lastIndexOf("."));

console.log(currentPageName);

// const user = getAuth(auth).currentUser;

let currUser = null;

onAuthStateChanged(auth, (user) => {
    currUser = auth.currentUser;

    // currUser.photoURL = '../images/photo-1631477076110-2b8c1fe0f3cc.avif'
    console.log("the user rn is ", currUser);

    if (user) {
        console.log("User is logged in:", user);

        signinEl.parentElement.style.display = "none";

        const postForm = document.querySelector(".post-form");
        const posts = document.querySelector(".posts");



        // 1 ----- CLICKED  THE BUTTON

        postForm.addEventListener("submit", function (e) {
            if (postForm.postTitle.value === "") return false;
            e.preventDefault();

            addDoc(postsRef, {
                userID: currUser.uid,
                title: postForm.postTitle.value,
                content: postForm.postContent.value,
                // check this later
                course: currentPageName,
                date: serverTimestamp(),
            });
            // console.log(postForm.postTitle);
            postForm.reset();
            console.log(posts);
        });



        // 2 ------ FETCH THE DAT 

        const postQuery = query(
            postsRef,
            where("course", "==", currentPageName), orderBy("date", "desc")
        );

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
                    snapshot.forEach((doc) => {
                        const post = createPost3(el, doc.data());
                        const tmpPost = document.getElementById(post.id);
                        posts.appendChild(post);

                        // -------------- COMMENTS FETCHING ----------- //
                    
                        const commentsQuery = query(
                            commentsRef,
                            where("postId", "==", el.id), where("parentCommentID", "==", null),
                            orderBy("date", "desc")
                        );

                        onSnapshot(commentsQuery, (snapshot) => {
                            post.querySelector(".comments").innerHTML = "";

                            snapshot.forEach((doc) => {
                                let commentEl = createComment3(post, doc, el);


                                // fetch the replies to the comment 

                                const commentRepliesQuery = query(
                                    commentsRef,
                                    where("parentCommentID", "==", doc.id),
                                    orderBy("date", "desc")
                                );

                                onSnapshot(commentRepliesQuery, (snapshot) => {
                                    commentEl.querySelector('.replies').innerHTML = ''

                                    snapshot.forEach(doc => {
                                        console.log(doc.data());
                                        
                                        createReply(commentEl, doc)
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

function createPost3(postDoc, userDoc) {
    // console.log("POST CREATED");

    // get user associated with the post

    // const userID = postDoc.userID;

    let posts = document.querySelector(".posts");

    let postEl = document.createElement("div");
    postEl.classList.add("post");
    postEl.id = postDoc.id;

    postEl.innerHTML = `
    

        


        <div class="post-details">


        <div class="post-heading-details"> 

            <div class="pfp-container">
                <img src="${userDoc.photoURL}" class="pfp" alt="img">
            </div>

            <div class="post-username">
                ${userDoc.name}

                <div class="post-date">
                    2 days ago
                </div>
            </div>

            <button class="post-delete">X</button>

        
        </div>

        

       

            <h3 class="title">${postDoc.title}</h3>

            <h4 class="content">${postDoc.content}</h4>

            <div class="post-details-user">

            
                <div class="votes">
                    <button class="upvote">
                        ^
                    </button>

                    <div class="votes-number">
                        12k
                    </div>

                    <button class="downvote">
                        v
                    </button>
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
            date: serverTimestamp(),
            parentCommentID: null
        });
    });

    const postReadEl = postEl.querySelector(".post-readbtn");
    const modalElement = postEl.querySelector(".post-modal");
    const postDeleteEl = postEl.querySelector(".post-delete")

    postDeleteEl.addEventListener("click", () => {
        
        console.log(postDoc.id);

        // postsRef.doc(postDoc.id).delete().then(() => {
        //     console.log("Successfuly delete");
            
        // })


        const docRef = doc(db, "posts", postDoc.id);

        console.log(docRef);
        
        deleteDoc(docRef); 
        
        
    })

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

    return postEl;
}

// console.log(createPost3());

function createComment3(postEl, commentDoc, postDoc) {
    let comments = postEl.querySelector(".comments");
    let newCommentEl = document.createElement("div");
    let commentData = commentDoc.data(); 
    newCommentEl.classList.add("comment");

    newCommentEl.dataset.id = commentDoc.id; 

    newCommentEl.innerHTML = `    
        <div class="reply-details">


        <div class="post-heading-details"> 

            <div class="pfp-container">
                <img src="../images/photo-1631477076110-2b8c1fe0f3cc.avif" class="pfp" alt="img">
            </div>

            <div class="post-username">
                ${currUser.displayName}

                <div class="post-date">
                    2 days ago
                </div>
            </div>

            <button class="post-delete">X</button>

        
        </div>

        

       

            <h3 class="title">${commentDoc.data().content}</h3>

            <div class="reply-details-user">

            
                <div class="votes">
                    <button class="upvote">
                        ^
                    </button>

                    <div class="votes-number">
                        12k
                    </div>

                    <button class="downvote">
                        v
                    </button>
                </div>

                <input placeholder="reply.." class="reply-inp input" type="text"/> 
                <button class="reply-btn primary-btn"> reply </button>

            </div>
        </div>

        <div class="replies"></div>
    `;


    console.log(commentDoc.id);
    


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
            date: serverTimestamp(),
            parentCommentID: commentId
        });
        
    })
    


} 

function createReply(commentEl, commentDoc, userDoc) {
    let newReply = document.createElement("div");
    let repliesDiv = commentEl.querySelector('.replies')
    newReply.innerHTML = `

        <div class="reply-details">


        <div class="post-heading-details"> 

            <div class="pfp-container">
                <img src="../images/photo-1631477076110-2b8c1fe0f3cc.avif" class="pfp" alt="img">
            </div>

            <div class="post-username">
                Osama

                <div class="post-date">
                    2 days ago
                </div>
            </div>

            <button class="post-delete">X</button>

        
        </div>

        

       

            <h3 class="title">${commentDoc.data().content}</h3>

            <div class="reply-details-user">

            
                <div class="votes">
                    <button class="upvote">
                        ^
                    </button>

                    <div class="votes-number">
                        12k
                    </div>

                    <button class="downvote">
                        v
                    </button>
                </div>


            </div>
        </div>
    
    `;


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

