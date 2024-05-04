const APP_ID = "2286e7d2ddeb4539aa30d69f25a230c9"

let uid = sessionStorage.getItem('uid'); 

if(!uid) {
    uid = String(Math.floor((Math.random() * 10000)))
    sessionStorage.setItem('uid', uid); 
}

let token = null; 
let client; 

let rtmClient; 
let channel; 




const queryString = window.location.search; 
const urlParams = new URLSearchParams(queryString); 
let roomId = urlParams.get('room'); 


if(!roomId) {
    roomId = 'main'; 
}


let displayName = sessionStorage.getItem('display_name'); 
if(!displayName) {
    window.location = 'lobby.html'
}


let localTracks = [];

let remoteUsers = {};

let localScreenTracks; 
let sharingScreen = false; 


let mediaRecorders = {}; // To manage multiple recorders
let audioBlobs = {}; // To store recorded blobs by user ID

// Start recording a specific media stream
function startRecording(uid, mediaStream) {
    if (mediaRecorders[uid]) {
        console.warn("Already recording this user:", uid);
        return;
    }

    let recorder = new MediaRecorder(mediaStream);
    mediaRecorders[uid] = recorder;
    audioBlobs[uid] = [];

    recorder.ondataavailable = function(event) {
        audioBlobs[uid].push(event.data);
    };

    recorder.onstop = function() {
        let audioBlob = new Blob(audioBlobs[uid], { type: 'audio/webm' });
        saveRecording(uid, audioBlob);
        delete mediaRecorders[uid]; // Clean up
        delete audioBlobs[uid];
    };

    recorder.start();
    console.log(`Recording started for user ${uid}`);
}

function stopRecording(uid) {
    if (mediaRecorders[uid]) {
        mediaRecorders[uid].stop();
        console.log(`Recording stopped for user ${uid}`);
    } else {
        console.log("No recorder found for user:", uid);
    }
}

// Save the recording as a downloadable file
function saveRecording(uid, blob) {

    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `recording_${uid}.webm`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);


    const formData = new FormData();
    formData.append('file', blob, `recording_${uid}.webm`);

    fetch('/transcribe-downloading', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => alert(data.transcription))
    .catch(error => console.error('Error uploading recording:', error));


}



let joinRoomInit = async () => {

    rtmClient = await AgoraRTM.createInstance(APP_ID);
    await rtmClient.login({uid, token}); 


    // in firebase change the display name to user name. 
    await rtmClient.addOrUpdateLocalUserAttributes({'name': displayName, })

    channel = await rtmClient.createChannel(roomId); 

    await channel.join(); 

    channel.on('MemberJoined', handleMemberJoined);
    channel.on('ChannelMessage', handleChannelMessage);
    
    channel.on('MemberLeft', handleMemberLeft);



    getMembers(); 
    addBotMessageToDom(`Welcome to the room ${displayName}! 👋`)


    client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});
    await client.join(APP_ID, roomId, token, uid); 


    client.on('user-published', handleUserPublished)
    client.on('user-left', handleUserLeft)



}

let joinStream = async() => {

    document.getElementById('join-btn').style.display = "none";
    document.getElementsByClassName('stream__actions')[0].style.display = "flex";


    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, {encoderConfig: {
        width: {min: 640, ideal: 1920, max: 1920}, 
        height: {min: 480, ideal: 1080,}
    }});

    let player = `<div class="video__container" id="user-container-${uid}">
                        <div class="video-player" id="user-${uid}"> </div>
                    </div>`

    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player); 
    document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)

    localTracks[1].play(`user-${uid}`);

    if (localTracks[0].type === "audio") {  // This is your audio track
        const audioStream = new MediaStream([localTracks[0].getMediaStreamTrack()]);
        startRecording(uid, audioStream);
    }   

    await client.publish([localTracks[0], localTracks[1]])


//     await localTracks[0].setMuted(true); 
//    await localTracks[1].setMuted(true);

//    document.getElementById('mic-btn').classList.remove('active'); 
//    document.getElementById('camera-btn').classList.remove('active');

}


let switchToCamera = async() => {
    let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"> </div>
                </div>`
    
   displayFrame.insertAdjacentHTML('beforeend', player);
   
   await localTracks[0].setMuted(true); 
   await localTracks[1].setMuted(true); 


   document.getElementById('mic-btn').classList.remove('active'); 
   document.getElementById('screen-btn').classList.remove('active'); 

   localTracks[1].play(`user-${uid}`);
   await client.publish([localTracks[1]])

}


let handleUserPublished = async (user, mediaType) => {
    remoteUsers[user.uid] = user;

    await client.subscribe(user, mediaType); 

    if (mediaType === 'audio') {
        const audioStream = new MediaStream([user.audioTrack.getMediaStreamTrack()]);
        startRecording(user.uid, audioStream);
    }
    

    let player = document.getElementById(`user-container-${user.uid}`); 
    
    if(player === null) {
        player = `<div class="video__container" id="user-container-${user.uid}">
                    <div class="video-player" id="user-${user.uid}"> </div>
                </div>`

        document.getElementById('streams__container').insertAdjacentHTML('beforeend', player); 
        document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandVideoFrame)


    }

    if(displayFrame.style.display) {
        let videoFrame = document.getElementById(`user-container-${user.uid}`); 
        videoFrame.style.height = '100px'
        videoFrame.style.width = '100px'

    }

    if(mediaType === 'video') {
        user.videoTrack.play(`user-${user.uid}`)
    }

    if(mediaType === 'audio') {
        user.audioTrack.play()
    }
         
    
}

// For local audio track
localTracks.forEach(track => {
    if (track.getType() === 'audio') {
        startRecording(uid, new MediaStream([track.getMediaStreamTrack()]));
    }
});


let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid];

    let item = document.getElementById(`user-container-${user.uid}`)

    if(item) {
        item.remove(); 
    }

    if(userIdInDisplayFrame === `user-container-${user.uid}`) {
        displayFrame.style.display = null;
        
        let videoFrames = document.getElementsByClassName('video__container'); 

        for(let i = 0; videoFrames.length > i; i++) {
            videoFrames[i].style.height = '300px';
            videoFrames[i].style.width = '300px';

        }
        
    }

}

let toggleMic = async (e) => {
    let button = e.currentTarget; 

    if(localTracks[0].muted) {
        await localTracks[0].setMuted(false); 
        button.classList.add("active"); 
    } else {
        await localTracks[0].setMuted(true); 
        button.classList.remove("active");
    }

}


let toggleCamera = async (e) => {
    let button = e.currentTarget; 

    if(localTracks[1].muted) {
        await localTracks[1].setMuted(false); 
        button.classList.add("active"); 
    } else {
        await localTracks[1].setMuted(true); 
        button.classList.remove("active");
    }

}

let toggleScreen = async (e) => {
    let screenButton = e.currentTarget; 
    let cameraButton = document.getElementById('camera-btn');

    if(!sharingScreen) {
        sharingScreen = true;
        
        screenButton.classList.add('active'); 
        cameraButton.classList.remove('active');
        cameraButton.style.display = 'none'; 

        localScreenTracks = await AgoraRTC.createScreenVideoTrack(); 

        document.getElementById(`user-container-${uid}`).remove(); 
        displayFrame.style.display = 'block'


        let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"> </div>
                </div>`

        displayFrame.insertAdjacentHTML('beforeend', player); 
        document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame);

        userIdInDisplayFrame = `user-container-${uid}`; 

        localScreenTracks.play(`user-${uid}`); 

        await client.unpublish([localTracks[1]]);
        await client.publish([localScreenTracks]);

        let videoFrames = document.getElementsByClassName('video__container');

        for(let i = 0; videoFrames.length > i; i++) {

            if(videoFrames[i].id != userIdInDisplayFrame) {
                videoFrames[i].style.height = '100px';
                videoFrames[i].style.width = '100px';
            }
    
        }



    } else {
        sharingScreen = false; 
        cameraButton.style.display = 'block'; 
        document.getElementById(`user-container-${uid}`).remove(); 
        await client.unpublish([localScreenTracks]); 

        switchToCamera(); 
    }
}


let leaveStream = async (e) => {
    e.preventDefault();
    document.getElementById('join-btn').style.display = "block";
    document.getElementsByClassName('stream__actions')[0].style.display = "none";


    for(let i = 0; localTracks.length > i; i++) {
        localTracks[i].stop()
        localTracks[i].close()

    }

    await client.unpublish([localTracks[0], localTracks[1]])

    if(localScreenTracks) {
        await client.unpublish([localScreenTracks])
    }


    document.getElementById(`user-container-${uid}`).remove(); 


    if(userIdInDisplayFrame === `user-container-${uid}`) {
        displayFrame.style.display = null; 

        for(let i = 0; videoFrames.length > i; i++) {
            videoFrames[i].style.height = '300px';
            videoFrames[i].style.width = '300px';
    
        }
        
    }

    channel.sendMessage({text: JSON.stringify({'type': 'user_left', 'uid': uid})})

}




document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('screen-btn').addEventListener('click', toggleScreen);
document.getElementById('join-btn').addEventListener('click', joinStream);
document.getElementById('leave-btn').addEventListener('click', leaveStream);



document.getElementById('start-recording-btn').addEventListener('click', () => {
    console.log('Start recording button clicked.');

        console.log('Starting recording for audio track.');
        const audioStream = new MediaStream([localTracks[0].getMediaStreamTrack()]);
        startRecording(uid, audioStream);
    
});

document.getElementById('stop-recording-btn').addEventListener('click', () => {
    console.log('Stop recording button clicked.');
    stopRecording(uid);  // Stop recording for the user's UID
});


document.getElementById('file-upload').addEventListener('change', function(event) {

    if (this.files.length > 0) {
        const formData = new FormData();
        formData.append('file', this.files[0]);

        fetch('/transcribe', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => alert(data.transcription))
        .catch(error => alert('Error uploading file: ' + error));
    }

    
});


document.querySelector('.summarize-msgs').addEventListener("click", async () => {
    // get the entire conversion list 
    const messageWrappers = document.querySelectorAll('.message__wrapper');
    console.log(messageWrappers);
    
    // Array to hold individual message texts
    const messages = [];    


    function capitalizeFirstLetter(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    // Loop through each message wrapper element
    for (const messageWrapper of messageWrappers) {
        // Extract author name and message text if found
        const authorElement = messageWrapper.querySelector('.message__author');
        const textElement = messageWrapper.querySelector('.message__text');
        
        // Check if both author and text elements are found
        if (authorElement && textElement) {
            const author = authorElement.textContent.trim().split(' ').map(capitalizeFirstLetter).join(' ');
            const text = textElement.textContent.trim();
    
            // Concatenate author name and message text
            const message = `${author}: ${text}`;
            messages.push(message);
        }
    }

    console.log(messages);

    // convert them into text 
    const mergedMessages = messages.join('\n');

    console.log(mergedMessages);

    try {
        // Send mergedMessages to server for summarization
        const response = await fetch('/sum', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({mergedMessages})
        });

        const data = await response.json();
        console.log(data);
        // Handle the summary as needed
    } catch (error) {
        console.error('Error:', error);
    }
})

joinRoomInit();