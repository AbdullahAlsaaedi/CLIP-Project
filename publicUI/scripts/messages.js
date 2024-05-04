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

const storage = getStorage();



// HTML ELEMENTS

const sendToBtn = document.querySelector(".sendTo-btn"); 
const sendToInput = document.querySelector(".sendTo-input"); 
const accountsFound = document.querySelector(".accounts-found"); 
const modalMessageInput = document.querySelector(".modal-message-input")
const modalMessageBtn = document.querySelector(".modal-message-area-btn")


document.querySelector('.new-message-btn').addEventListener('click', function() {
    document.querySelector('.accounts-modal').classList.toggle('active');
    document.querySelector('.overlay').classList.toggle('hidden');

    

});

document.querySelector('.accounts-modal-closebtn').addEventListener('click', closeModal);


document.querySelector('.overlay').addEventListener('click', closeModal);



function closeModal() {
    document.querySelector('.accounts-modal').classList.remove('active');
    document.querySelector('.overlay').classList.add('hidden');
}




const usersRef = collection(db, "users");
const conversationsRef = collection(db, "conversations");

let currUser = null;

onAuthStateChanged(auth, (user) => {
    currUser = auth.currentUser;

    // currUser.photoURL = '../images/photo-1631477076110-2b8c1fe0f3cc.avif'
    console.log("the user rn is ", currUser);

    if (user) {
        console.log("User is logged in:", user);

        searchForUser(); 
        initateConversation();
        fetchDMs(); 

        

    }
});




function fetchDMs() {
    const convQuery = query(
        conversationsRef,
        where("participants", "array-contains", currUser.uid)
    );

    onSnapshot(convQuery, snapshot => {
        console.log("!");
        
        const usersList = document.querySelector(".user-list-users"); 

        usersList.innerHTML = "";   
        snapshot.docs.forEach(conv => {
            createDirectMsgHtml(conv)

            console.log(conv.data());
            
        })
    })
}


async function createDirectMsgHtml(conv) {
    const participants = conv.data().participants; 
    const usersList = document.querySelector(".user-list-users"); 

    // Create JS ELEMENTS
    const convDM = document.createElement("div")
    convDM.classList.add("user-list-user")
    convDM.classList.add("user-list-1")
    convDM.dataset.id = conv.id; 
    convDM.dataset.clicked = "false"; 



    const recieverId = participants[0] === currUser.uid  ? participants[1] : participants[0]; 

    const q = query(usersRef, where("uid", "==", recieverId));

    const usersDoc = await getDocs(q); 

    const reciever = usersDoc.docs[0];
    const revieverName = reciever.data().name; 

    const imageRef = ref(storage, `profiles/${reciever.id}`);

    const url = await getDownloadURL(imageRef)
        

    // const recieverToDisplay = conv.data().participants[0] === currUser.uid ? currUser.displayName : "Lol"; 

    convDM.innerHTML = 
    `
    <div class="user-pfp-container"><img src="${url}" alt="pfp" class="user-pfp"></div>
    ${revieverName}
    `


    usersList.appendChild(convDM)


    openDM(convDM, reciever)

    //
}




function searchForUser() {
    sendToBtn.addEventListener("click", (e) => {
        e.preventDefault();
        getUser(sendToInput)
    })

}

function getUser(sendToInput) {

    const username = sendToInput.value; 

    if(username === "") {
        console.log("Empty user !");
        return; 
    }

    const userQuery = query(
        usersRef,
        where("name", "==", username)
    );

    onSnapshot(userQuery, (snapshot) => {
        
        if(snapshot.docs.length === 0) {
            console.log("Couldn't find the user, try again!");
            return; 
        }

        accountsFound.innerHTML = ""; 

        snapshot.docs.forEach(doc => {
            const user = doc; 
            console.log(user.id);
            console.log("The users: ", user.uid, currUser.uid);
            
            if(user.data().uid !== currUser.uid) createUserElement(user);
        })

        

        
    })

}


async function initateConversation() {

    modalMessageBtn.addEventListener("click", async () => {
        const msg = modalMessageInput.value; 
        let radios = document.querySelectorAll(`input[name="selectUser"]:checked`);

        if(radios.length === 0) return; 

        let radio = radios[0];
        const recieverId = radio.parentElement.dataset.id; 

        console.log(recieverId, currUser.uid);


        const q = query(conversationsRef, where("participants", "array-contains", currUser.uid));
        const querySnapshot = await getDocs(q);
        let conversationExists = false;

        querySnapshot.forEach(doc => {
            if (doc.data().participants.includes(recieverId)) {
                conversationExists = true;
            }
        });


        // Insert into the db 

        if (!conversationExists) {
            addDoc(conversationsRef, {
                lastMessage: msg,
                messageTimeStamp: serverTimestamp(),
                senderId: currUser.uid,
                recieverId: recieverId,
                participants: [currUser.uid, recieverId]
            }).then((conversationRef) => {
                closeModal();
            });
        } else {
            console.log("Conversation already exists");
            closeModal();
        }

        

    })
}








async function createUserElement(userDoc) {
    const userId = userDoc.id; 
    const userData = userDoc.data(); 

    console.log(userId);
    

    const imageRef = ref(storage, `profiles/${userId}`);

    const url = await getDownloadURL(imageRef)

    
    // create js element 
    
    const userEl = document.createElement("div"); 

    userEl.classList.add("account-found"); 
    userEl.dataset.id = userData.uid;

    userEl.innerHTML = 
    `
    <div class="pfp-container">
        <img src="${url}" alt="pfp" class="pfp">
    </div>
    ${userData.name} 
    <input class="select-user-input" name="selectUser" id="selectUser" type="radio">
    `

    accountsFound.appendChild(userEl) 


    const userDM = document.querySelectorAll('.user-list-user');
    

    

}



const conversationHeader = document.querySelector(".conversation-header")
const conversationHeaderPfp = document.querySelector(".conversation-header-pfp")
const conversationHeaderMore = document.querySelector(".conversation-header-more")
const messages = document.querySelector('.message-area'); 


function openDM(userDM, reciever) {
        userDM.addEventListener("click", async () => {

            const msgInp = document.querySelector(".message-input"); 

            const msgBtn = document.querySelector(".message-area-btn")


            msgInp.value = ""


            let convoID = userDM.dataset.id; 
            msgBtn.dataset.id = userDM.dataset.id;

            console.log(convoID);
            

            // pfp 
            const pfp = userDM.querySelector(".user-pfp")

            // name 
            const userName = userDM.textContent

            const imageRef = ref(storage, `profiles/${reciever.id}`);

            const url = await getDownloadURL(imageRef)

            // make the header to reciever 
            conversationHeader.innerHTML = 
            `
            <img src="${url}" alt="logo" class="conversation-header-pfp">
            <p class="conversation-header-username">${userName}</p>

            <div class="dropdown">
                <button class="dropbtn">
                    <img src="../images/icons8-info-50.png" alt="Info"/>
                </button>
                <div class="dropdown-content" id="myDropdown">
                    <a href="#" id="closeMessage">Close the message</a>
                    <a href="#" class="red" id="deleteMessage">Delete the message</a>
                </div>
            </div>


            `
            moreButtonFunctionality(conversationHeader);

        

            // make the userDM the current active one 
            const openDMS = document.querySelectorAll('.openedDM');

            openDMS.forEach(element => {
                element.classList.remove('openedDM');
            });

            userDM.classList.add("openedDM")
            
            

            // insert the data

            
            // insert a message as sub collection 
            let convoRef = doc(conversationsRef, convoID); 


            const clicked = userDM.dataset.clicked;
            const messagesRef = collection(convoRef, "messages");
            const q = query(messagesRef, orderBy('timestamp', 'asc')) // or 'desc' for descending
            
            msgBtn.disabled = false; 
            msgInp.disabled = false; 


            if(clicked == "false") {
                msgBtn.addEventListener("click", (e) => {
                    e.preventDefault(); 
                    
                    userDM.dataset.clicked = "true"; 
                    


                    console.log(userDM);
                    
                    // create new document inside the message collection that is nested inside conversations 
                    const openedDM = document.querySelector(".openedDM")

                    console.log(openedDM);

                    convoID = userDM.dataset.id

                    if(!userDM.classList.contains("openedDM")) return; 

                    convoRef = doc(conversationsRef, convoID); 

                    if(msgInp.value.trim() == "") {
                        return;
                    }

                    addDoc(messagesRef, {
                        senderId: currUser.uid,
                        text: msgInp.value, 
                        timestamp: serverTimestamp(),
                        read: false
                    })

                    msgInp.value = ""



                    // document.addEventListener('keydown', (keyEvent) => {
                    //     if(keyEvent.key == "Enter") {
                    //         addDoc(messagesRef, {
                    //             senderId: currUser.uid,
                    //             text: msgInp.value, 
                    //             timestamp: serverTimestamp(),
                    //             read: false
                    //         })
                    //     }
                        
                    // })

                })
            }


            // fetch the data 
            onSnapshot(q, snapshot => {
                messages.innerHTML = "";
                
                snapshot.docs.forEach((doc, index, array) => {
                    console.log(doc.data().text);
                    
                    displayMessages(doc)

                    if(index == array.length - 1) messages.scrollTop = messages.scrollHeight;
                })
            })
            
           

        })
}


function displayMessages(doc) {
    // 1. create js element
    const msg = document.createElement("div"); 
    msg.classList.add('message'); 

    doc.data().senderId === currUser.uid && msg.classList.add('currrent-user');

    msg.innerHTML = `${doc.data().text}`

    // 2. select message-area 

    // 3. if the current message doc.sendedId = current.uid, added class .sender
    
    // 4. .sender class => flex end, different color, etc 

    // 5. append them to it 
    messages.appendChild(msg)


}



function moreButtonFunctionality(conversationHeader) {


    /* 

     <div class="dropdown">
                <button class="dropbtn">
                    <img src="../images/icons8-info-50.png" alt="Info"/>
                </button>
                <div class="dropdown-content" id="myDropdown">
                    <a href="#" id="closeMessage">Close the message</a>
                    <a href="#" id="deleteMessage">Delete the message</a>
                </div>
            </div>

    */

    conversationHeader.querySelector('.dropbtn').addEventListener('click', function(event) {
        var dropdown = conversationHeader.querySelector("#myDropdown");
        dropdown.classList.toggle("show");
    });

    const closeMsgEl = document.getElementById("closeMessage")
    const dltMsgEl = document.getElementById("deleteMessage")

    
    dltMsgEl.addEventListener("click", () => {
        deleteMsg(); 
    })

    closeMsgEl.addEventListener("click", () => {
        closeMsg(); 
    })
}


 async function deleteMsg() {
    const currentOpenDM = document.querySelector(".openedDM"); 
    const msgArea = document.querySelector(".message-area"); 

    console.log(currentOpenDM.dataset.id);
    const dmID = currentOpenDM.dataset.id; 
    const docRef = doc(db, "conversations", dmID);
    

    // delete the document here: 
    // code: 

     // Assuming messages are stored in a subcollection inside each conversation
     const messagesCollectionRef = collection(docRef, "messages");

     // First, delete all messages in the subcollection
     const messagesSnapshot = await getDocs(messagesCollectionRef);
     const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
     await Promise.all(deletePromises);
 
     // Then, delete the conversation document itself
     await deleteDoc(docRef);


    // closing the message
    closeMsg()
    
}

async function deleteDocumentWithSubcollections(docRef) {

    docRef = db.doc(docRef);
    const collections = await docRef.listCollections();
    
    for (const collection of collections) {
        const snapshot = await collection.get();

        for (const doc of snapshot.docs) {
            await deleteDocumentWithSubcollections(`${docRef}/${collection.id}/${doc.id}`);
        }
    }

    await docRef.delete();

}


function closeMsg() {
    const msgArea = document.querySelector(".message-area"); 
    const headerArea = document.querySelector(".conversation-header"); 

    msgArea.innerHTML = ""
    headerArea.innerHTML = ""

    emptyMessagesForm()
}



const messageForm = document.querySelector('.message-input-container'); 
const searchAccForm = document.querySelector('.sendTo'); 

function emptyMessagesForm() {
    messageForm.reset(); 
    searchAccForm.reset(); 

    document.querySelector(".message-input").disabled = true; 
    document.querySelector(".message-area-btn").disabled = true; 

}

window.onload = emptyMessagesForm;






// Close the dropdown menu if clicked outside
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn, .dropbtn *')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
};

// Functionality for menu options
document.getElementById('closeMessage').addEventListener('click', function() {
    // Implement close message logic
    console.log("Message closed");
});

document.getElementById('deleteMessage').addEventListener('click', function() {
    // Implement delete message logic
    console.log("Message deleted");
});
