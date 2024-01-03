const scrollContainer = document.querySelector('.horizontal-scroll-container');
const progressBar = document.querySelector('.scroll-progress-bar');
const scrollbtn = document.querySelector('.scroll-btn');


console.log(progressBar);




scrollContainer.addEventListener('scroll', () => {
const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
const currentScroll = scrollContainer.scrollLeft + 60;
const scrollPercentage = (currentScroll / maxScrollLeft) * 100;

progressBar.style.width = scrollPercentage + '%';
});

scrollbtn.addEventListener("click", () => {
    console.log('hey');
    
    scrollContainer.scrollLeft += 300; 
})







const colRef = collection(db, 'posts');
console.log(colRef);
