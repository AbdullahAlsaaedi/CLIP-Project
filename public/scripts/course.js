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
                date: serverTimestamp(),
            });
            // console.log(postForm.postTitle);
            postForm.reset();
            console.log(posts);
        });

        const postQuery = query(postsRef, orderBy("date", "desc"));

        onSnapshot(
            postQuery,
            (snapshot) => {
                let postsArr = [];
                snapshot.docs.forEach((el) =>
                    postsArr.push({ ...el.data(), id: el.id })
                );

                posts.innerHTML = "";

                postsArr.forEach((el) => {
                    const post = createPost(el);
                    posts.appendChild(post);
                    
                    // get the comments 
                    const commentsQuery = query(commentsRef, where('postId', '==', el.id), orderBy('date', 'desc'));

                    onSnapshot(commentsQuery, snapshot => {
                        post.querySelector(".comments").innerHTML = "";      


                        snapshot.forEach(doc => {

                            console.log(doc.id);

                            addComment(post, doc.data())

                        })

                    })
                });
            },
            orderBy("desc")
        );
    } else {
        console.log("User is not logged in");
    }
});

singoutEl.addEventListener("click", (e) => {
    e.preventDefault();

    signOut(auth)
        .then(() => {
            console.log("User signed out");
            window.location.href = "../html/signin.html";
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
