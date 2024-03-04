const admin = require('firebase-admin');
const express = require('express');


const app = express();

app.set('view engine', 'ejs'); 

app.use(express.static("publicUI"))
app.use(express.urlencoded({ extended: true }));


admin.initializeApp({
    credential: admin.credential.cert(require('./clip-4cdf9-firebase-adminsdk-673ej-f5b6499acb.json')),
    // If you're using Firestore or Firebase Realtime Database, add their URLs here
    // databaseURL: 'https://your-database-name.firebaseio.com',
    databaseURL: 'https://clip-4cdf9.firestore.euw.firebasedatabase.app.',
});

const db = admin.firestore();
const { collection, onSnapshot } = db;


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

app.post("/create-course", async (req, res) => {
    const coursesRef = db.collection("courses")
    
    
    const courseData = req.body;
    
    const newCourseRef = await coursesRef.add(courseData);
    const docSnapshot = await newCourseRef.get(); // `get` is a method on the DocumentReference
    const data = docSnapshot.data();

    res.redirect(`/html/courses2.html/${docSnapshot.id}`); 
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
