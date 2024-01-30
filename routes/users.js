const express = require('express');
const router = express.Router();


router.get("/", (req, res) => {
    res.send("root")
})


router.get("/new", (req, res) => {
    res.send("New user created")
})

router.post("/new", (req, res) => {
    res.send("New user created")
})




router.get("/:id", (req, res) => {
    res.send("USERS ID")
})

module.exports = router; 