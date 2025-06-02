document.addEventListener("DOMContentLoaded", () => {
  // Carrega o header
  fetch('../views/header.html')
    .then(response => response.text())
    .then(headerHTML => {
      document.querySelector('body').insertAdjacentHTML('afterbegin', headerHTML);

      // Ativa o menu hamburger depois de inserir o header
      document.getElementById('hamburger')?.addEventListener('click', function () {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active');

        const bars = document.querySelectorAll('.hamburger .bar');
        bars.forEach(bar => {
          bar.classList.toggle('active');
        });
      });
    });

  // Carrega o footer
  fetch('../views/footer.html')
    .then(response => response.text())
    .then(footerHTML => {
      document.querySelector('body').insertAdjacentHTML('beforeend', footerHTML);
    });

  // Botão Começar redireciona p cadastro.html
  const beginBtn = document.getElementById("begin");
  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
      window.location.href = "cadastro.html";
    });
  }

  // Carrossel
  let index = 0;
  function moveCarousel(step) {
    const carouselItems = document.querySelector('.carousel-items');
    const total = document.querySelectorAll('.carousel-items .feature-card').length;
    index = (index + step + total) % total;
    carouselItems.style.transform = `translateX(-${index * 100}%)`;
  }

  document.querySelector('.carousel-prev')?.addEventListener('click', () => moveCarousel(-1));
  document.querySelector('.carousel-next')?.addEventListener('click', () => moveCarousel(1));

});

//Cadastro de usuário
document.addEventListener("DOMContentLoaded", () => {
  const btnCadastro = document.querySelector(".btnCadastro");

  if (btnCadastro) {
    btnCadastro.addEventListener("click", async (e) => {
      e.preventDefault();

      const nome = document.getElementById("nome").value.trim();
      const email = document.getElementById("email").value.trim();
      const senha = document.getElementById("senha").value;
      const confirmarSenha = document.getElementById("confirmarSenha").value;
      const idade = document.getElementById("idade").value.trim();
      const erroSenha = document.getElementById("erroSenha");

      if (!nome || !email || !idade || !senha || !confirmarSenha) {
        alert("Preencha todos os campos!");
        return;
      }

      if (senha !== confirmarSenha) {
        erroSenha.innerText = "As senhas não coincidem.";
        erroSenha.style.display = "block";
        return;
      } else {
        erroSenha.style.display = "none";
      }

      const anoAtual = new Date().getFullYear();
      const anoNascimento = anoAtual - parseInt(idade);
      const dataNascimento = `${anoNascimento}-01-01`;

      const dados = {
        usuario_nome: nome,
        usuario_email: email,
        usuario_data_nascimento: dataNascimento
      };

      try {
        const response = await fetch("/api/usuarios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dados)
        });

        const resultado = await response.json();

        if (response.ok) {
          alert("Cadastro realizado com sucesso!");
          window.location.href = "paginaInicial.html";
        } else {
          alert("Erro: " + resultado.message);
        }
      } catch (error) {
        console.error("Erro ao cadastrar:", error);
        alert("Erro ao conectar com o servidor.");
      }
    });
  }
});

