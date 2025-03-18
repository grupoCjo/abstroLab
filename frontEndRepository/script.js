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
    // function validarSenhas() {
    //     const senha = document.getElementById('senha').value;
    //     const confirmarSenha = document.getElementById('confirmarSenha').value;
    //     const mensagemErro = document.getElementById('erroSenha');

    //     if (senha !== confirmarSenha) {
    //         mensagemErro.style.display = 'block';
    //         mensagemErro.innerText = '*As senhas não coincidem';
    //     } else {
    //         mensagemErro.style.display = 'none'; 
    //         // colocar aqui o cod p enviar p bd
    //         console.log("As senhas coincidem. Enviar para o banco de dados.");
    //     }
    // }

    // document.querySelector('.btnCadastro').addEventListener('click', function(e) {
    //     e.preventDefault(); 
    //     validarSenhas(); 
    // });

//Criação de endpoint para INSERT no banco com dados do --CADASTRO--

document.querySelector(".btnCadastro").addEventListener("click", async () => {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;
    const dataNascimento = document.getElementById("dataNascimento").value; // Novo campo

    // Validação básica dos campos de senha
    if (senha !== confirmarSenha) {
        document.getElementById("erroSenha").innerText = "As senhas não coincidem!";
        document.getElementById("erroSenha").style.display = "block";
        return;
    } else {
        document.getElementById("erroSenha").style.display = "none";
    }

    const dados = { nome, email, senha, dataNascimento };

    try {
        const response = await fetch("http://localhost:3000/cadastrar", { //chama o endpoint cadastrar (VEJA O ARQUIVO server.js, o endpoint está lá) e executa o método POST para enviar os dados para o BD.
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
        });

        const resultado = await response.json();
        alert(resultado.message);
    } catch (error) {
        console.error("Erro ao cadastrar:", error);
        alert("Erro ao cadastrar usuário.");
    }
});

