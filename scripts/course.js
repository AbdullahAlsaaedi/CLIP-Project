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
const commentsRef = collection(db, "comments");


let currentURL = window.location.href;
            let currentPageName = currentURL.substr(currentURL.lastIndexOf('/') + 1);
            currentPageName = currentPageName.substr(0, currentPageName.lastIndexOf('.'))

            console.log(currentPageName);
            

// const user = getAuth(auth).currentUser;

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user);

        signinEl.parentElement.style.display = "none";

        const postForm = document.querySelector(".post-form");
        const posts = document.querySelector(".posts");

        postForm.addEventListener("submit", function (e) {
            if (postForm.postTitle.value === "") return false;
            e.preventDefault();


            
            addDoc(postsRef, {
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
        
    
        const postQuery =   query(postsRef, where('course', '==', currentPageName), orderBy('date', 'desc'));

         onSnapshot(
            postQuery,
            (snapshot) => {
                let postsArr = [];
                snapshot.docs.forEach((el) =>
                    postsArr.push({ ...el.data(), id: el.id })
                );

                posts.innerHTML = "";

                postsArr.forEach((el) => {
                    const post = createPost3(el);
                    posts.appendChild(post);
                    
                    // get the comments 
                    const commentsQuery = query(commentsRef, where('postId', '==', el.id), orderBy('date', 'desc'));

                    onSnapshot(commentsQuery, snapshot => {
                        post.querySelector(".comments").innerHTML = "";      


                        snapshot.forEach(doc => {

                            console.log(doc.id);

                            createComment3(post, doc.data())

                        })

                    })
                });
            },
           
        );
    } else {
        console.log("User is not logged in");
        window.location.href = '../index.html'
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

function createPost(el) {
    // Create a new DOM element
    const div = document.createElement("div");
    div.classList.add("post");
    div.setAttribute("data-id", el.id);

    // Create an h3 element for the title
    const h3 = document.createElement("h3");
    h3.classList.add("title");
    h3.textContent = el.title;

    // Create a p element for the content
    const p = document.createElement("p");
    p.textContent = el.content;

    // Create an input element for comments
    const input = document.createElement("input");
    input.classList.add("commentIn");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "Add a comment");

    // Create a button element for comments
    const button = document.createElement("button");
    button.classList.add("commentBtn");

    const comments = document.createElement("div");
    comments.classList.add("comments");

    div.classList.add("post");

    button.addEventListener("click", (e) => {
        e.preventDefault();
        const postId = el.id;
        const commentContent = input.value;

        // add comment to databse

        addDoc(commentsRef, {
            postId: postId,
            content: commentContent,
            date: serverTimestamp(),
        });
    });

    button.textContent = " > ";

    // Append the child elements to the 'div' element
    div.appendChild(h3);
    div.appendChild(p);
    div.appendChild(input);
    div.appendChild(button);
    div.appendChild(comments);
    // Now, 'div' contains the entire DOM structure you provided

    return div;
}

function addComment(post, comment) {

    const comments = post.querySelector('.comments');
        
    const commentDiv = document.createElement("div");
    comments.appendChild(commentDiv);
    commentDiv.classList.add("comment");

    // Create a text node for the text content "logo"
    const logoText = document.createTextNode("logo");

    // Create a div element with the class "p" for the content
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("p");
    contentDiv.textContent = comment.content;

    // Append the logo text and the content div to the comment div
    commentDiv.appendChild(logoText);
    commentDiv.appendChild(contentDiv);

    return commentDiv;
}



// const postReadEls = document.querySelectorAll('.post-readbtn');
// const modalElements = document.querySelectorAll('.post-modal');

// // Add a click event listener to each post
// postReadEls.forEach((postRead, index) => {

//     postRead.addEventListener('click', (event) => {
//         // Display the corresponding modal using the index

//         console.log("Hey");
        
//         modalElements.forEach(e => e.classList.add("hidden"))

//         if (modalElements[index]) {

//             let currModal = modalElements[index];

//             currModal.classList.remove("hidden");
//             document.body.classList.add("no-scroll");

//             let closeBtn = modalElements[index].querySelector(".modal-close")
            
//             closeBtn.addEventListener("click", () => {
//                 currModal.classList.add("hidden");
//                 document.body.classList.remove("no-scroll");

//             })

//             document.addEventListener('keydown', (event) => {
//                 if (event.key === 'Escape') {
//                   modalElements.forEach((modal) => {
//                     currModal.classList.add("hidden");
//                     document.body.classList.remove('no-scroll'); // Remove the class to enable scrolling
//                   });
//                 }
//               });

//             console.log(modalElements[index]);
        
//         }
//     });
// });


function createPost2(el) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');
    postElement.setAttribute("data-id", el.id);

    // Create the votes div
    const votesElement = document.createElement('div');
    votesElement.classList.add('votes');

    // Create the upvote button
    const upvoteButton = document.createElement('button');
    upvoteButton.classList.add('upvote');
    upvoteButton.textContent = '^';

    // Create the votes number
    const votesNumber = document.createElement('div');
    votesNumber.classList.add('votes-number');
    votesNumber.textContent = '12k';

    // Create the downvote button
    const downvoteButton = document.createElement('button');
    downvoteButton.classList.add('downvote');
    downvoteButton.textContent = 'v';

    // Create the post details div
    const postDetailsElement = document.createElement('div');
    postDetailsElement.classList.add('post-details');

    // Create the post title
    const postTitle = document.createElement('h3');
    postTitle.classList.add('title');
    postTitle.textContent = el.title;

    // Create the post details user div
    const postDetailsUserElement = document.createElement('div');
    postDetailsUserElement.classList.add('post-details-user');

    // Create the profile picture container
    const pfpContainer = document.createElement('div');
    pfpContainer.classList.add('pfp-container');

    // Create the profile picture
    const pfpImage = document.createElement('img');
    pfpImage.classList.add('pfp');
    pfpImage.setAttribute('src', '');
    pfpImage.setAttribute('alt', 'img');

    // Create the post username
    const postUsername = document.createElement('div');
    postUsername.classList.add('post-username');
    postUsername.textContent = 'ahmed mosa';

    // Create the post date
    const postDate = document.createElement('div');
    postDate.classList.add('post-date');
    postDate.textContent = el.date;

    // Create the "Read more" button
    const readMoreButton = document.createElement('button');
    readMoreButton.classList.add('post-readbtn');
    readMoreButton.textContent = 'Read more';

    const modal = createModal()

    // Append the elements to build the post structure
    votesElement.appendChild(upvoteButton);
    votesElement.appendChild(votesNumber);
    votesElement.appendChild(downvoteButton);

    pfpContainer.appendChild(pfpImage);

    postDetailsUserElement.appendChild(pfpContainer);
    postDetailsUserElement.appendChild(postUsername);
    postDetailsUserElement.appendChild(postDate);

    postDetailsElement.appendChild(postTitle);
    postDetailsElement.appendChild(postDetailsUserElement);

    postElement.appendChild(votesElement);
    postElement.appendChild(postDetailsElement);
    postElement.appendChild(readMoreButton);
    postElement.appendChild(modal)


    return postElement;
    
}


function createModal() {
    const postModalElement = document.createElement('div');
    postModalElement.classList.add('post-modal', 'hidden');

    // Create the modal close button
    const closeButton = document.createElement('button');
    closeButton.classList.add('modal-close');
    closeButton.textContent = 'X';

    // Create the modal title
    const modalTitle = document.createElement('h3');
    modalTitle.classList.add('title');
    modalTitle.textContent = 'KEKW';

    // Create the modal content
    const modalContent = document.createElement('p');
    modalContent.textContent = 'content';

    // Create the comment input field
    const commentInput = document.createElement('input');
    commentInput.classList.add('commentIn');
    commentInput.setAttribute('type', 'text');
    commentInput.setAttribute('placeholder', 'Add a comment');

    // Create the comment button
    const commentButton = document.createElement('button');
    commentButton.classList.add('commentBtn');
    commentButton.textContent = '+';

    // Create the comments div
    const commentsDiv = document.createElement('div');
    commentsDiv.classList.add('comments');

    // Create a comment div
    const comment1 = document.createElement('div');
    commentsDiv.appendChild(comment1)
    comment1.classList.add('comment');

    // Create the logo for the first comment
    const logo1 = document.createElement('div');
    logo1.textContent = 'logo';

    // Create the content for the first comment
    const content1 = document.createElement('div');
    content1.classList.add('p');
    content1.textContent = 'content';

    // Append the comment elements to the comment div
    comment1.appendChild(logo1);
    comment1.appendChild(content1);

    // Repeat the above steps to create additional comment divs as needed

    // Append all elements to build the post modal structure
    postModalElement.appendChild(closeButton);
    postModalElement.appendChild(modalTitle);
    postModalElement.appendChild(modalContent);
    postModalElement.appendChild(commentInput);
    postModalElement.appendChild(commentButton);
    postModalElement.appendChild(commentsDiv);

    // Append the post modal element to the document body
    return postModalElement; 
}



function createComment2(post, commentDb) {

}


function createPost3(postDoc) {
    let postEl = document.createElement("div"); 
    postEl.classList.add("post");

    postEl.innerHTML = `
    

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


        <div class="post-details">
            <h3 class="title">${postDoc.title}</h3>

            <div class="post-details-user">

                <div class="pfp-container">
                    <img src="" class="pfp" alt="img">
                </div>

                <div class="post-username">
                    ahmed mosa
                </div>

                <div class="post-date">
                    2 days ago
                </div>

            </div>
        </div>
        
        <button class="post-readbtn">Read more</button>

        <div class="post-modal hidden">
            <button class="modal-close">X</button>

            <h3 class="title">${postDoc.title}</h3>

            <p>${postDoc.content}</p>
            <input class="commentIn" type="text" placeholder="Add a comment"></input>
            <button class="commentBtn"> + </button>

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



`

    let button = postEl.querySelector('.commentBtn');
    let input = postEl.querySelector('.commentIn');

    button.addEventListener("click", (e) => {
        e.preventDefault();
        const postId = postDoc.id;
        const commentContent = input.value;

        // add comment to databse

        addDoc(commentsRef, {
            postId: postId,
            content: commentContent,
            date: serverTimestamp(),
        });
    });



    const postReadEl = postEl.querySelector('.post-readbtn');
    const modalElement = postEl.querySelector('.post-modal');


    postReadEl.addEventListener('click', () => {
        {
            // Display the corresponding modal using the index
        
            console.log("Hey");
            
                let currModal = modalElement;
        
                modalElement.classList.remove("hidden");
                document.body.classList.add("no-scroll");
        
                let closeBtn = modalElement.querySelector(".modal-close");
                
                closeBtn.addEventListener("click", () => {
                    modalElement.classList.add("hidden");
                    document.body.classList.remove("no-scroll");
        
                })
        
                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape') {
                        currModal.classList.add("hidden");
                        document.body.classList.remove('no-scroll'); // Remove the class to enable scrolling
                    }
                  })
                    
            }
    });



    return postEl; 
}

// console.log(createPost3());



function createComment3(postEl, postDoc) {

    let comments = postEl.querySelector(".comments"); 
    let newCommentEl = document.createElement("div"); 
    newCommentEl.classList.add('comment');

    newCommentEl.innerHTML = 
    `
    <div class="comment">
        logo
        <div class="p">${postDoc.content}</div>
    </div>
    `

    comments.appendChild(newCommentEl);
    
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

        })

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                currModal.classList.add("hidden");
                document.body.classList.remove('no-scroll'); // Remove the class to enable scrolling
            }
          })

        console.log(modalElements[index]);
    
    }
