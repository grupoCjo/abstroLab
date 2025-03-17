//script em js p menu
    
document.getElementById('hamburger').addEventListener('click', function() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active'); 

    const bars = document.querySelectorAll('.hamburger .bar');
    bars.forEach(bar => {
        bar.classList.toggle('active'); 
    });
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

//enviar o cadastro p DB

    // Função de validação de senha
    function validarSenhas() {
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const mensagemErro = document.getElementById('erroSenha');

        if (senha !== confirmarSenha) {
            mensagemErro.style.display = 'block';
            mensagemErro.innerText = '*As senhas não coincidem';
        } else {
            mensagemErro.style.display = 'none'; 
            // colocar aqui o cod p enviar p bd
            console.log("As senhas coincidem. Enviar para o banco de dados.");
        }
    }

    document.querySelector('.btnCadastro').addEventListener('click', function(e) {
        e.preventDefault(); 
        validarSenhas(); 
    });
