
const enrollbtn = document.querySelector(".enrollbtn"); 

enrollbtn.addEventListener("click", () => {
    let url = window.location.href; 
    let parts = url.split("/"); // Split the URL by "/"
    let lastPart = parts[parts.length - 1]; // Get the last part of the array
    console.log(lastPart);
    
    window.location.href = `/html/courses2.html/${lastPart}`
    
})
