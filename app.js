const admin = require('firebase-admin');
const express = require('express');
const speech = require('@google-cloud/speech')
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg');
const toWav = require('audiobuffer-to-wav');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');




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

app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies


const cors = require('cors');
app.use(cors());



// transcription 

process.env.GOOGLE_APPLICATION_CREDENTIALS = 'steam-treat-421920-e0d672bf8e90.json'; // Set the path to your Google Cloud service account key.


function convertWebmToWav(inputBuffer, outputPath) {
    return new Promise((resolve, reject) => {
        const inputPath = 'temp_input.webm'; // Temp input file path
        fs.writeFileSync(inputPath, inputBuffer); // Write the buffer to a file

        ffmpeg(inputPath)
            .output(outputPath)
            .audioCodec('pcm_s16le') // Set codec to PCM 16-bit
            .audioFrequency(44100)   // Set sample rate to 44100 Hz
            .on('end', () => {
                fs.unlinkSync(inputPath); // Clean up input file
                resolve(outputPath);
            })
            .on('error', (err) => {
                fs.unlinkSync(inputPath); // Clean up input file even on error
                reject(err);
            })
            .toFormat('mp3')
            .run();
    });
}

async function transcribeAudio(audioBuffer) {
    try {
        const speechClient = new speech.SpeechClient();

        // Convert the buffer to base64
        const audioBytes = audioBuffer.toString('base64');

        const audio = {
            content: audioBytes
        };

        const config = {
            // Uncomment and adjust the following lines as necessary
            // encoding: 'LINEAR16',
            // sampleRateHertz: 44100,
            languageCode: 'en-US'
        };

        // Perform the speech recognition
        const [response] = await speechClient.recognize({ audio, config });
        return response.results.map(r => r.alternatives[0].transcript).join("\n");
    } catch (error) {
        console.error('Error:', error);
        throw error; // Throw the error so it can be caught by the caller
    }
}

// (async () => {
//     // Call the transcribeAudio function to transcribe 'output.mp3'.
//     const text = await transcribeAudio('t4.wav');


//     // Extract and log the transcribed text from the response.
//     console.log(text[0].results.map(r => r.alternatives[0].transcript).join("\n"));
// })();


app.post('/transcribe', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const transcription = await transcribeAudio(req.file.buffer);
        // console.log(transcription[0].results.map(r => r.alternatives[0].transcript).join("\n"));

        res.json({ transcription: transcription });
    } catch (err) {
        res.status(500).send('Failed to transcribe file: ' + err.message);
    }
});



app.post('/transcribe-downloading', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const outputPath = 'temp_output.wav'; // Temp output file path

    try {
        // Convert webm to wav before transcribing
        await convertWebmToWav(req.file.buffer, outputPath);
        
        // Read the converted file into a buffer
        const audioBuffer = fs.readFileSync(outputPath);
        
        // Transcribe the audio file
        const transcription = await transcribeAudio(audioBuffer);
        
        // Clean up the output file
        fs.unlinkSync(outputPath);
        
        res.json({ transcription });
    } catch (err) {
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath); // Ensure clean up even on error
        }
        console.error('Failed to process file:', err);
        res.status(500).send('Failed to transcribe file: ' + err.message);
    }
});


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




// Example input text

// app.post('/sum', (req, res) => {
//     const { inputText } = req.body;
    

//     // Execute the Python script with input text
//     const pythonProcess = spawn('python', ['transcribe.py', inputText]);

//     // Handle output from the Python script
//     let summary = '';
//     pythonProcess.stdout.on('data', (data) => {
//         summary += data.toString();
//     });

//     pythonProcess.stderr.on('data', (data) => {
//         console.error(`Error: ${data}`);
//     });

//     pythonProcess.on('close', (code) => {
//         console.log(`Child process exited with code ${code}`);
//         res.json({ summary });
//     });
// });



app.post('/sum', (req, res) => {
    const {mergedMessages} = req.body;



    console.log("The textis", mergedMessages);
    
    

    // Execute the Python script with input text
    const pythonProcess = spawn('python', ['transcript.py', mergedMessages]);

    // Handle output from the Python script
    let summary = '';
    pythonProcess.stdout.on('data', (data) => {
        summary += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
        res.json({ summary });
    });
});





const usersRouter = require('./routes/users');
const { on } = require('nodemon');
app.use('/users', usersRouter)


app.listen(3004);


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
