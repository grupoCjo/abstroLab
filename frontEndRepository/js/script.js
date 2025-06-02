document.addEventListener("DOMContentLoaded", () => {
  // Carrega o header
  fetch('../views/header.html')
    .then(response => response.text())
    .then(headerHTML => {
      document.querySelector('body').insertAdjacentHTML('afterbegin', headerHTML);

      document.getElementById('hamburger')?.addEventListener('click', function () {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active');

        const bars = document.querySelectorAll('.hamburger .bar');
        bars.forEach(bar => bar.classList.toggle('active'));
      });
    });

  // Carrega o footer
  fetch('../views/footer.html')
    .then(response => response.text())
    .then(footerHTML => {
      document.querySelector('body').insertAdjacentHTML('beforeend', footerHTML);
    });

  // Botão Começar redireciona p ../views/cadastro.html
  const beginBtn = document.getElementById("begin");
  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
      window.location.href = "../views/cadastro.html";
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

  const btnCadastro = document.querySelector(".btnCadastro");
if (btnCadastro) {
  btnCadastro.addEventListener("click", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;
    const dataNascimento = document.getElementById("dataNascimento").value;
    const erroSenha = document.getElementById("erroSenha");

    if (!nome || !email || !dataNascimento || !senha || !confirmarSenha) {
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

    // Verificação de data válida (simples)
    if (isNaN(Date.parse(dataNascimento))) {
      alert("Informe uma data de nascimento válida.");
      return;
    }

    const dados = {
      usuario_nome: nome,
      usuario_email: email,
      usuario_data_nascimento: dataNascimento, // formato YYYY-MM-DD
      usuario_senha: senha
    };

    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });

      const resultado = await response.json();

      if (response.ok) {
        alert("Cadastro realizado com sucesso!");
        window.location.href = "paginaInicial.html";
      } else {
        alert("Erro: " + (resultado.message || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert("Erro ao conectar com o servidor.");
    }
  });
}

  // Login
  const btnEntrar = document.getElementById("btnEntrar");
  if (btnEntrar) {
    btnEntrar.addEventListener("click", async () => {
      const email = document.getElementById("emailLogin").value.trim();
      const senha = document.getElementById("senhaLogin").value;
      const erroLogin = document.getElementById("erroLogin");

      if (!email || !senha) {
        erroLogin.innerText = "Por favor, preencha todos os campos.";
        erroLogin.style.display = "block";
        return;
      }

      try {
        // Faz login
        const response = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
        });

        const resultado = await response.json();

        if (response.ok) {
          const usuario_ID = resultado.usuario_ID;

          // Cria sessão para usuário logado
          const sessaoResponse = await fetch("/api/sessoes/criar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario_ID, sessao_status: "ativa" })
          });

          const sessaoResult = await sessaoResponse.json();

          if (sessaoResponse.ok) {
            console.log("Sessão criada com sucesso:", sessaoResult.sessao_ID);
          } else {
            console.warn("Erro ao criar sessão:", sessaoResult.message);
          }

          alert("Login efetuado com sucesso!");
          window.location.href = "paginaInicial.html";
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
  }
});
