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
    res.send("COOL SHIT")
})

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
