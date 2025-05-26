 import { carregarPaginaInicial } from './paginaInicial.js'; // importa o arquivo de pagina inicial para ser chamado após efetuar cadastro/login
 
 // Carrega o header
     fetch('../views/header.html')
        .then(response => response.text())
        .then(headerHTML => {
        document.querySelector('body').insertAdjacentHTML('afterbegin', headerHTML);
    });

  // Carrega o footer
  fetch('../views/footer.html')
    .then(response => response.text())
    .then(footerHTML => {
      document.querySelector('body').insertAdjacentHTML('beforeend', footerHTML);
    });

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
document.addEventListener("DOMContentLoaded", () => {
    let index = 0;

    function moveCarousel(step) {
        const carouselItems = document.querySelector('.carousel-items');
        const total = document.querySelectorAll('.carousel-items .feature-card').length;
        index = (index + step + total) % total;
        carouselItems.style.transform = `translateX(-${index * 100}%)`;
    }

    document.querySelector('.carousel-prev').addEventListener('click', () => moveCarousel(-1));
    document.querySelector('.carousel-next').addEventListener('click', () => moveCarousel(1));
});



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
  const dataNascimento = document.getElementById("dataNascimento").value;

  if (senha !== confirmarSenha) {
    document.getElementById("erroSenha").innerText = "As senhas não coincidem!\nPor favor, tente novamente.";
    document.getElementById("erroSenha").style.display = "block";
    return;
  } else {
    document.getElementById("erroSenha").style.display = "none";
  }

  const dados = { nome, email, senha, dataNascimento };

  try {
    const response = await fetch("http://localhost:3000/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    const resultado = await response.json();
    alert(resultado.message);

    if (response.ok) {
      carregarPaginaInicial(); // <-- Chama a função da nova página que está no arquivo paginaInicial.js
    }

  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Erro ao cadastrar usuário.");
  }
});

document.getElementById("entrarBtn").addEventListener("click", async () => {
  const email = document.getElementById("emailLogin").value;
  const senha = document.getElementById("senhaLogin").value;

  const erroLogin = document.getElementById("erroLogin");

  if (!email || !senha) {
    erroLogin.innerText = "Por favor, preencha todos os campos.";
    erroLogin.style.display = "block";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const resultado = await response.json();

    if (response.ok) {
      alert("Login efetuado com sucesso!");
      // Redireciona após login
      carregarPaginaInicial(); // <-- Chama a função da nova página que está no arquivo paginaInicial.js";
    } else {
      erroLogin.innerText = resultado.message || "Email ou senha inválidos.";
      erroLogin.style.display = "block";
    }

  } catch (error) {
    console.error("Erro ao fazer login:", error);
    erroLogin.innerText = "Erro na conexão com o servidor.";
    erroLogin.style.display = "block";
  }
});

document.getElementById("begin").addEventListener("click", () => {
    window.location.href = "cadastro.html";
})
