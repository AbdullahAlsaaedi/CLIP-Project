const express = require('express');
const app = express();

const middleware = require('./middleware'); 
// parsing incoming json 
app.use(express.json()); 

const PORT = 4000; 


app.post('/generate', middleware.generateToken, (req, res) => {
     

    res.status(200).send(res.locals.signature); 
})
app.use((err, req, res, next) => {
    console.log(err);

    const defaultErr = {
        log: "unknown error occurred", 
        status: 500, 
        message: {err: 'error has occurred'} 
    }; 

    const errorObj = Object.assign({}, defaultErr, err);
    
    return res.status(errorObj.status).json(errorObj.message)
});

app.listen(PORT, () => {
    console.log(`Servers listening to ${PORT}`);
    
})


module.exports = app 