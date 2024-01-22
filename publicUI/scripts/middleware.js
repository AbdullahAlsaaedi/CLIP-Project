const KJUR = require('jsrsasign'); // creating signuture 
require('dotenv').config(); // dot env reading env variable 


const middleware = {}; 

middleware.generateToken = (req, res, next) => {

    try {

        let signature = ''; 
        const iat = Math.round(new Date().getTime / 1000); 
        const exp = iat + 60 * 60 * 2; 

        const oHeader = {alg: 'HS256', typ: 'JWT'}

        // destructure request body to access acreditianls 

        const {topic, passWord, userIdentity, sessionKey, roleType} = req.body

        // senstivie to env var 
        const sdkKey = process.env.SDK_KEY;
        const sdkSecret = process.env.SDK_SECRET; 

        

        const oPayload = {
            app_key: sdkKey, 
            iat, 
            exp, 
            tpc: topic, 
            pwd: passWord, 
            user_identity: userIdentity, 
            session_key: sessionKey, 
            role_type: roleType,
        };

        const sHeader = JSON.stringify(oHeader); 
        const sPayload = JSON.stringify(oPayload); 

        signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, sdkSecret); 

        // save sign to res.locals object 
        res.locals.signature = signature; 
        return next(); 

    } catch(err) {
        return next({err})
    }


}


module.exports = middleware;