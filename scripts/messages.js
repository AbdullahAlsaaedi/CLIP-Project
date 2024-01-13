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
        

    // const recieverToDisplay = conv.data().participants[0] === currUser.uid ? currUser.displayName : "Lol"; 

    convDM.innerHTML = 
    `
    <div class="user-pfp-container"><img src="../images/photo-1631477076110-2b8c1fe0f3cc.avif" alt="pfp" class="user-pfp"></div>
    ${revieverName}
    `


    usersList.appendChild(convDM)


    openDM(convDM)

    //
}




function searchForUser() {
    sendToBtn.addEventListener("click", () => {
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








function createUserElement(userDoc) {
    const userId = userDoc.id; 
    const userData = userDoc.data(); 

    
    // create js element 
    
    const userEl = document.createElement("div"); 

    userEl.classList.add("account-found"); 
    userEl.dataset.id = userData.uid;

    userEl.innerHTML = 
    `
    <div class="pfp-container">
        <img src="" alt="pfp" class="pfp">
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


function openDM(userDM) {
        userDM.addEventListener("click", () => {

            const msgInp = document.querySelector(".message-input"); 

            const msgBtn = document.querySelector(".message-area-btn")

            msgInp.disabled = false; 
            msgBtn.disabled = false; 


            let convoID = userDM.dataset.id; 
            msgBtn.dataset.id = userDM.dataset.id;

            console.log(convoID);
            

            // pfp 
            const pfp = userDM.querySelector(".user-pfp")

            // name 
            const userName = userDM.textContent



            // make the header to reciever 
            conversationHeader.innerHTML = 
            `
            <img src="" alt="logo" class="conversation-header-pfp">
            <p class="conversation-header-username">${userName}</p>
            <img class="conversation-header-more" src="" alt="More..">
            `

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
 


            if(clicked == "false") {
                msgBtn.addEventListener("click", () => {
                    
                    userDM.dataset.clicked = "true"; 
                    
                    console.log(userDM);
                    
                    // create new document inside the message collection that is nested inside conversations 
                    const openedDM = document.querySelector(".openedDM")

                    console.log(openedDM);

                    convoID = userDM.dataset.id

                    if(!userDM.classList.contains("openedDM")) return; 

                    convoRef = doc(conversationsRef, convoID); 

                    addDoc(messagesRef, {
                        senderId: currUser.uid,
                        text: msgInp.value, 
                        timestamp: serverTimestamp(),
                        read: false
                    })


                    

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


