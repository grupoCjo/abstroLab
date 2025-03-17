
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});


// Carrossel! ! ! 
let index = 0;

function moveCarousel(step) {
    const carouselItems = document.querySelector('.carousel-items');
    const total = document.querySelectorAll('.carousel-items .feature-card').length;
    index = (index + step + total) % total;
    carouselItems.style.transform = `translateX(-${index * 100}%)`;
}

document.querySelector('.carousel-prev').addEventListener('click', () => moveCarousel(-1));
document.querySelector('.carousel-next').addEventListener('click', () => moveCarousel(1));
