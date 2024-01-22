import React from "react";
import ReactDOM from "react-dom/client";
import './index.css'
import App from "./App";

import {devConfig} from './devConfig'; 
import ZoomVideo from '@zoom/videosdk'; 

let meetingArgs = {...devConfig}; 

const getToken = async(options) {
    // fetch to backend to generate sdk jwt 

    let response = await fetch('/generate', options).then(respone => respone.json());


    return response; 
}


if(!meetingArgs.signature && meetingArgs.topic) {

    // requestObj with method header and body 

    const requestOptions = {
        method: 'POST', 
        header: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(meetingArgs)
    }



    getToken(requestOptions).then(res => meetingArgs.signature = res)
}


const client = ZoomVideo.createClient(); 

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
    <React.StrictMode> 
        <ZoomContext.Provider value = {client}> 
        <App meetingArgs = {meetingArgs}/>
        </ZoomContext.Provider> 
    </React.StrictMode>
)
