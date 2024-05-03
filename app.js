const admin = require('firebase-admin');
const express = require('express');
const speech = require('@google-cloud/speech')
const fs = require('fs')



const app = express();

app.set('view engine', 'ejs'); 

app.use(express.static("publicUI"))
app.use(express.urlencoded({ extended: true }));







admin.initializeApp({
    credential: admin.credential.cert(require('./clip-4cdf9-firebase-adminsdk-673ej-f5b6499acb.json')),
    // If you're using Firestore or Firebase Realtime Database, add their URLs here
    // databaseURL: 'https://your-database-name.firebaseio.com',
    databaseURL: 'https://clip-4cdf9.firestore.euw.firebasedatabase.app.',
    storageBucket: 'clip-4cdf9.appspot.com'
});

const db = admin.firestore();
const { collection, onSnapshot } = db;



const storage = admin.storage();

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { v4: uuidv4 } = require('uuid');




// transcription 

process.env.GOOGLE_APPLICATION_CREDENTIALS = 'steam-treat-421920-e0d672bf8e90.json'; // Set the path to your Google Cloud service account key.


async function transcribeAudio(audioName) {
    try {
        // Initialize a SpeechClient from the Google Cloud Speech library.
        const speechClient = new speech.SpeechClient();

        // Read the binary audio data from the specified file.
        const file = fs.readFileSync(audioName);
        const audioBytes = file.toString('base64');

        // Create an 'audio' object with the audio content in base64 format.
        const audio = {
            content: audioBytes
        };

        // Define the configuration for audio encoding, sample rate, and language code.
        const config = {
            // encoding: 'LINEAR16',   // Audio encoding (change if needed).
            // sampleRateHertz: 44100, // Audio sample rate in Hertz (change if needed).
            languageCode: 'en-US'   // Language code for the audio (change if needed).
        };

        // Return a Promise for the transcription result.
        return new Promise((resolve, reject) => {
            // Use the SpeechClient to recognize the audio with the specified config.
            speechClient.recognize({ audio, config })
                .then(data => {
                    resolve(data); // Resolve the Promise with the transcription result.
                })
                .catch(err => {
                    reject(err); // Reject the Promise if an error occurs.
                });
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

(async () => {
    // Call the transcribeAudio function to transcribe 'output.mp3'.
    const text = await transcribeAudio('t4.wav');


    // Extract and log the transcribed text from the response.
    console.log(text[0].results.map(r => r.alternatives[0].transcript).join("\n"));
})();


app.get("/", (req, res) => {
   // 
})


app.get("/html/courses2.html/review/:id", async (req, res) => {
    const id = req.params.id; 

    const docRef = db.collection("courses").doc(id); // `doc` is a method on the CollectionReference
    const docSnapshot = await docRef.get(); // `get` is a method on the DocumentReference
    const data = docSnapshot.data(); 
    const courseID = docSnapshot.id; 

    // querying the users collection 
    const usersQuery = await db.collection('users').where('uid', '==', data.userUid).get(); 

    const userDoc = usersQuery.docs[0];
    const userData = userDoc.data();


    const videosSnapshot = await docRef.collection('videos').get();
    const videosCount = videosSnapshot.size;





//    console.log(data.userUid);
    

    // if(userDoc.exists) console.log("exists", userDoc);
    

    
    const crsDesc = data['crs-desc']; 
    const crsName = data['crs-name']; 
    const crsLogo = data['crs-logo']; 

    
    // create the ejs html template 
    res.render("coursePreview", {course: data, user: userData, id: courseID, videosCount});
}); 


app.get("/user/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);
    

    try {
        
        const docRef = db.collection("users").doc(id); // `doc` is a method on the CollectionReference
        const docSnapshot = await docRef.get(); // `get` is a method on the DocumentReference
        const data = docSnapshot.data(); 

        const name = data.name; 
        const email = data.email; 
        const uid = data.uid; 


        res.render("profile", {user: data});

        // if (docSnapshot.exists) {
        //     res.send(docSnapshot.data());
        // } else {
        //     res.status(404).send('Document not found');
        // }


    } catch (error) {
        console.error("Error fetching document: ", error);
        res.status(500).send('WTF');
    }
})



// creating courses ! 

app.post("/create-course", upload.single('crs-logo'), async (req, res) => {

        // Get current date
    const currentDate = new Date();


    // Define options for formatting
    const options = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
    };

    // Format the date
    const formattedDate = currentDate.toLocaleDateString('en-US', options);


    try {
        const file = req.file;
        const randomId = uuidv4();
        const logoURL = `courses/${randomId}`;

        if (file) {
            // Upload the file to Firebase Storage
            const blob = storage.bucket().file(logoURL);
            const blobWriter = blob.createWriteStream({
              metadata: {
                contentType: file.mimetype,
              },
            });
      
            blobWriter.on('error', (err) => console.error(err));
            blobWriter.on('finish', async () => {
              // The file is uploaded, now you can save the course info to Firestore with the logoURL
              const publicUrl = `https://storage.googleapis.com/${storage.bucket().name}/${logoURL}`;
                
              const coursesRef = db.collection("courses")
              req.body.date = formattedDate; 
              req.body.logoURL = publicUrl; 
              req.body.logoID = randomId; 


              const courseData = req.body;
                

              
              const newCourseRef = await coursesRef.add(courseData);
              const docSnapshot = await newCourseRef.get(); // `get` is a method on the DocumentReference
              const data = docSnapshot.data(); 

              res.redirect(`/html/courses2.html/${docSnapshot.id}`); 

              
            });
      
            blobWriter.end(file.buffer);
          } else {
            res.status(400).send('No logo file uploaded.');
          }
        } catch (error) {
          console.error('Error submitting course:', error);
          res.status(500).send(error.message);
        }
    


    // render the course 


    
    
})


// get course 

app.get("/html/courses2.html/:id", async (req, res) => {
    const id = req.params.id; 

    // fetch from firebase 

    const docRef = db.collection("courses").doc(id); // `doc` is a method on the CollectionReference
    const docSnapshot = await docRef.get(); // `get` is a method on the DocumentReference
    const data = docSnapshot.data(); 
    const courseID = docSnapshot.id; 
    const crsDesc = data['crs-desc']; 
    const crsName = data['crs-name']; 


    // create the ejs html template 
    res.render("course", {course: data, id: courseID});

    // style it 

    // uploading a video functionality 

    // when uploaded, insert video to database 

    // fetch the videos and display them into the sidebar 

    // when sidebar is clicked, make the video active 
    
})



const usersRouter = require('./routes/users');
const { on } = require('nodemon');
app.use('/users', usersRouter)


app.listen(3001);


// const port = 3000;

// // Serve static files
// app.use('/css', express.static('css')); // Serve CSS files
// app.use('/scripts', express.static('scripts')); // Serve JavaScript files
// app.use('/html', express.static('html')); // Serve HTML files as static files
// app.use('/images', express.static('images')); // Serve images

// // You can still have dynamic routes if needed
// app.get('/profile', (req, res) => {
//     res.sendFile(__dirname + '/html/profile.html');
// });

// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });
