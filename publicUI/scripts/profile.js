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
    arrayUnion
} from "./firebaseconfig.js";

const usersRef = collection(db, "users");
const posts = collection(db, "posts");
const commentsRef = collection(db, "comments");


let currUser = null;
let overlay = document.querySelector(".modal-overlay");


onAuthStateChanged(auth, (user) => {
    currUser = auth.currentUser;

    // currUser.photoURL = '../images/photo-1631477076110-2b8c1fe0f3cc.avif'
    console.log("the user rn is ", currUser);

    if (user) {
        console.log("User is logged in:", user);

        fetchPosts(user); 

        const viewedUserId = extractIdFromUrl(window.location.href)

        checkFollowStatus(user, viewedUserId);

        document.querySelector('.followBtn').addEventListener('click', () => toggleFollow(user, viewedUserId));

        fetchFollows(user);

        
        // const followersBtn = document.querySelector('.followers');
        // const followingsBtn = document.querySelector('.followings');


        // followersBtn.addEventListener('click', () => fetchFollowings(user));
        // followingsBtn.addEventListener('click', () => fetchFollowers(user));



        

    }
});


function extractIdFromUrl(urlString) {
    const url = new URL(urlString);
    const segments = url.pathname.split('/');
    const id = segments.pop(); // Gets the last segment of the pathname
    return id;
}


let fetchPosts = async function(user) {
    
    const viewedUserId = extractIdFromUrl(window.location.href)
    const docRef = doc(db, 'users', viewedUserId);
    const userDoc = await getDoc(docRef); // Retrieve the document
    
    const userData = userDoc.data(); 

    
    const q = query(posts, where("userID", "==", userData.uid))
    const activities = document.querySelector('.activities'); 

    onSnapshot(q, (snapshot) => {
        snapshot.docs.forEach(postData => {
            console.log(postData.data());
            const post = displayPosts(postData, userDoc.data())
            activities.appendChild(post)


            const commentsQuery = query(
                commentsRef,
                where("postId", "==", postData.id), where("parentCommentID", "==", null),
                orderBy("date", "desc")
            );

            onSnapshot(commentsQuery, (snapshot) => {
                post.querySelector(".comments").innerHTML = "";

                snapshot.forEach((doc) => {
                    let commentEl = createComment3(post, doc, postData);
                    
                    


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




        })
    })
}

let displayPosts = function(postDoc, userDoc) {

        const postData = postDoc.data(); 
    
        let posts = document.querySelector(".posts");
    
        let postEl = document.createElement("div");
        postEl.classList.add("post");
        postEl.id = postDoc.id;
        
    
    
    
        if(postData.type === "text") {
    
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
    
            
    
           
    
                <h3 class="title">${postData.title}</h3>
    
                <h4 class="content">
                    
                    ${postData.content}
                </h4>
    
                <div class="post-details-user">
    
                
                    <div class="votes">
                        <div class="like-container">
                            <img src="../images/heart-svgrepo-com.svg" alt="" class="like-svg">
                            <div class="likes-num">321 likes</div> 
    
                        </div>
        
        
                        <div class="comment-container">
                            <img src="../images/comment.svg" alt="" class="comment-svg">
                            <div class="comments-num"> 23 comments </div> 
    
                        </div>
                    </div>
    
                    <button class="post-readbtn primary-btn">Read more</button>
    
    
                </div>
            </div>


            <div class="post-modal hidden">
            <button class="modal-close">X</button>

            <h3 class="title">${postData.title}</h3>

            <p>${postData.content}</p>
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

    console.log(postEl.querySelector('.post-readbtn'));
    
    
    
    
        } else if (postData.type === "image") {
    
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
    
            
    
           
    
                <h3 class="title">${postData.title}</h3>
    
                <h4 class="content">
                    
                <img src="${postData.content}" />
                </h4>
    
                <div class="post-details-user">
    
                
                    <div class="votes">
                        <div class="like-container">
                            <img src="../images/heart-svgrepo-com.svg" alt="" class="like-svg">
                            <div class="likes-num">321 likes</div> 
    
                        </div>
        
        
                        <div class="comment-container">
                            <img src="../images/comment.svg" alt="" class="comment-svg">
                            <div class="comments-num"> 23 comments </div> 
    
                        </div>
                    </div>
    
                    <button class="post-readbtn primary-btn">Read more</button>
    
    
                </div>
            </div>
            
    
            <div class="post-modal hidden">
                <button class="modal-close">X</button>
    
                <h3 class="title">${postData.title}</h3>
    
                <p>${postData.content}</p>
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
        
    
    
    
    
        // ADDING A COMMENT -----------------------------------
        console.log(postEl.querySelector('.commentBtn'));

    
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
    
            // postsRef.doc(postData.id).delete().then(() => {
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
    
    

function createComment3(postEl, commentDoc, postData) {
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

                    <div class="like-container">
                        <img src="../images/heart-svgrepo-com.svg" alt="" class="like-svg">
                    </div>
            
            
                    <div class="comment-container">
                        <img src="../images/comment.svg" alt="" class="comment-svg">
                    </div>
                    
                </div>

                <input placeholder="reply.." class="reply-inp input" type="text"/> 
                <button class="reply-btn primary-btn"> reply </button>

            </div>
        </div>

        <div class="replies"></div>
    `;


    console.log(commentDoc.id);
    


    replies(newCommentEl, commentDoc, postData); 

    comments.appendChild(newCommentEl);

    return newCommentEl;
}

function replies(commentEl, commentDoc, postData) {

    const replyInpEl = commentEl.querySelector('.reply-inp')
    const replyBtnEl = commentEl.querySelector('.reply-btn')


    replyBtnEl.addEventListener('click', (e) => {
        console.log(replyInpEl.value);
        console.log(commentDoc.id);
        
        const commentId = commentDoc.id; 
        const postId = postData.id; 
        console.log(postId);
        
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
  








// Function to check follow status
async function checkFollowStatus(user, viewedUserId) {

    const currentUser = user;

    const usersRef = collection(db, 'users');
    const currentUserQ = query(usersRef, where('uid', '==', user.uid));
    const currentUserSnap = await getDocs(currentUserQ);
    const currentUserDoc = currentUserSnap.docs[0]; 


    if (!currentUser || currentUserDoc.id === viewedUserId) {
        // Hide button if not logged in or viewing own profile
        document.querySelector('.followBtn').style.display = 'none';
        return;
    }

    // Check if the current user is following the viewed user
    const docRef = doc(db, 'users', currentUserDoc.id);

    const docSnap = await getDoc(docRef);

    
    
    if (docSnap.exists() && docSnap.data().following?.includes(viewedUserId)) {
        // If already following, show "Followed" and disable button
        document.querySelector('.followBtn').innerText = 'Followed';
        document.querySelector('.followBtn').disabled = true;
    } else {
        // If not following, show "Follow" and enable button
        document.querySelector('.followBtn').innerText = 'Follow';
        document.querySelector('.followBtn').disabled = false;
    }
    document.querySelector('.followBtn').style.display = 'block';
}

// Function to follow/unfollow a user
async function toggleFollow(user, viewedUserId) {
    // Continue to use the query to find the current user's document reference for consistency with your existing code
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const currentUserRef = querySnapshot.docs[0].ref; // Current user's document reference

    // Direct reference to the viewed user's document, assuming viewedUserId corresponds to the document ID
    const viewedUserRef = doc(db, 'users', viewedUserId);

    const action = document.querySelector('.followBtn').innerText === 'Follow' ? 'follow' : 'unfollow';

    if (action === 'follow') {
        // Update the current user's document to add viewedUserId to their 'following' array
        await updateDoc(currentUserRef, {
            following: arrayUnion(viewedUserId)
        });
        // Update the viewed user's document to add the current user's uid to their 'followers' array
        await updateDoc(viewedUserRef, {
            followers: arrayUnion(currentUserRef.id)
        });

        document.querySelector('.followBtn').innerText = 'Followed';
    } else {
        // Update the current user's document to remove viewedUserId from their 'following' array
        await updateDoc(currentUserRef, {
            following: arrayRemove(viewedUserId)
        });
        // Update the viewed user's document to remove the current user's uid from their 'followers' array
        await updateDoc(viewedUserRef, {
            followers: arrayRemove(user.uid)
        });

        document.querySelector('.followBtn').innerText = 'Follow';
    }
    document.querySelector('.followBtn').disabled = true;
}




async function fetchFollows(user) {
        const followersBtn = document.querySelector('.followers');
        const followingsBtn = document.querySelector('.followings');
        const followsModal = document.querySelector('.follows-modal');
        const closeBtn = document.querySelector('.close-follows-modal-btn');
        const listContent = document.querySelector('.follows-modal .list-content');
        const modalTitle = document.querySelector('.follows-modal .follows-modal-title');


        const viewedUserId = extractIdFromUrl(window.location.href)
        const docRef = doc(db, 'users', viewedUserId);
        const userDoc = await getDoc(docRef); // Retrieve the document
        const userData = userDoc.data(); 
    
    
        const followersListNum = userData.followers?.length ? userData.followers.length : 0 ; 
        const followingsListNum = userData.following?.length ? userData.following.length : 0; 

        console.log(followersListNum, followingsListNum);

        document.querySelector(".followers-num").textContent = followersListNum; 
        document.querySelector(".followings-num").textContent = followingsListNum; 






        fetchFollowings(user); 
        fetchFollowers(user)

    
        // Function to open modal with specific list
        async function openModalWithList(listType) {
            followsModal.style.display = "block";
            modalTitle.textContent = listType === 'followers' ? 'Followers' : 'Followings';     

           if(listType === 'followings') {
            const followersList = document.querySelector('.followers-list-content'); 
            const followingsList = document.querySelector('.followings-list-content'); 
            followersList.style.display = "none"
            followingsList.style.display = "block"

           }

           if(listType === 'followers') {
            const followingsList = document.querySelector('.followings-list-content'); 
            const followersList = document.querySelector('.followers-list-content'); 
            followingsList.style.display = "none"
            followersList.style.display = "block"

           }

        }

        


    
        // Button event listeners
        followersBtn.addEventListener('click', () => openModalWithList('followers'));
        followingsBtn.addEventListener('click', () => openModalWithList('followings'));

       


        
    
        // Close modal
        closeBtn.addEventListener('click', () => {
            followsModal.style.display = "none";
        });
    
        // Close modal if user clicks anywhere outside of the modal content
        window.onclick = function(event) {
            if (event.target == followsModal) {
                followsModal.style.display = "none";
            }
        };
}

async function fetchFollowers(user) {

    console.log("================");




    const viewedUserId = extractIdFromUrl(window.location.href)
    const docRef = doc(db, 'users', viewedUserId);
    const userDoc = await getDoc(docRef); // Retrieve the document
    const userData = userDoc.data(); 




    const list = userData.followers; 
    
    console.log(list);
        
    if(!list) return; 

async function fetchFollowers(user) {

    console.log("================");


    const viewedUserId = extractIdFromUrl(window.location.href)
    const docRef = doc(db, 'users', viewedUserId);
    const userDoc = await getDoc(docRef); // Retrieve the document
    const userData = userDoc.data(); 

    const followingsList = document.querySelector('.followings-list-content'); 

    followingsList.innerHTML = ""; 


    const list = userData.followers; 
    
    console.log(list);
        
    if(!list) return; 


    

    list.forEach(async item => {
        
        console.log("!!!!!!");

        const docRef = doc(db, 'users', item);
        const userDoc = await getDoc(docRef); // Retrieve the document
        
        const userData = userDoc.data(); 


        displayFollowers(userData); 
        
    });

}    

    list.forEach(async item => {
        console.log("!!!!!!");
        
        // const div = document.createElement('div');
        // div.textContent = item.name; // Assuming 'name' field exists
        // console.log(item);
        // listContent.appendChild(div);

        const docRef = doc(db, 'users', item);
        const userDoc = await getDoc(docRef); // Retrieve the document
        
        const userData = userDoc.data(); 


        displayFollowers(userDoc); 
        
    });

}


async function fetchFollowings(user) {

    const viewedUserId = extractIdFromUrl(window.location.href)
    const docRef = doc(db, 'users', viewedUserId);
    const userDoc = await getDoc(docRef); // Retrieve the document
    
    const userData = userDoc.data(); 




    const list = userData.following; 

    console.log(list);
        
    if(!list) return; 

    list.forEach(async (item, i) => {
        console.log("CURR INDEX ", i);
        
        // const div = document.createElement('div');
        // div.textContent = item.name; // Assuming 'name' field exists
        // console.log(item);
        // listContent.appendChild(div);

        const docRef = doc(db, 'users', item);
        const userDoc = await getDoc(docRef); // Retrieve the document
        
        const userData = userDoc.data(); 

        displayFollowings(userDoc); 
        
    });

    
}

function displayFollowings(userDoc) {
    
    const userData = userDoc.data(); 



    const followingsList = document.querySelector('.followings-list-content'); 
    
    const userFollow = document.createElement('div');
    userFollow.classList.add("user-follow"); 
    userFollow.innerHTML = `${userData.name}`
    userFollow.dataset.id = userDoc.id; 


    userFollow.addEventListener("click", () => {
        window.location.href = `/user/${userFollow.dataset.id}`
        
    })

    followingsList.append(userFollow); 



}


function displayFollowers(userDoc) {

    const userData = userDoc.data(); 

    const followersList = document.querySelector('.followers-list-content'); 
    
    const userFollow = document.createElement('div');
    userFollow.classList.add("user-follow"); 
    userFollow.innerHTML = `${userData.name}`
    userFollow.dataset.id = userDoc.id; 




    userFollow.addEventListener("click", () => {

        window.location.href = `/user/${userFollow.dataset.id}`
        
    })
    

    followersList.append(userFollow)

}




