document.addEventListener("DOMContentLoaded", () => {
  carregarHeaderFooter();
  inicializarEventosGlobais();
  inicializarCarrossel();
  inicializarCadastro();
  inicializarLogin();
});

function carregarHeaderFooter() {
  // Carrega o header e inicializa funcionalidades dele
  fetch('../views/header.html')
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html);
      setupHamburgerMenu();
      // Se a página tiver uma função global chamada inicializarPagina, executa
      if (typeof window.inicializarPagina === 'function') {
        window.inicializarPagina();
      }
    });

  // Carrega o footer
  fetch('../views/footer.html')
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);
    });
}

function setupHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  hamburger?.addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
    document.querySelectorAll('.hamburger .bar').forEach(bar => bar.classList.toggle('active'));
  });
}

function inicializarEventosGlobais() {
  // Botão Começar redireciona para cadastro
  const beginBtn = document.getElementById("begin");
  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
      window.location.href = "../views/cadastro.html";
    });
  }
}

function inicializarCarrossel() {
  if (!document.querySelector('.carousel-items')) return;

  let index = 0;
  const carouselItems = document.querySelector('.carousel-items');
  const totalItems = carouselItems.querySelectorAll('.feature-card').length;

  const moveCarousel = (step) => {
    index = (index + step + totalItems) % totalItems;
    carouselItems.style.transform = `translateX(-${index * 100}%)`;
  };

  document.querySelector('.carousel-prev')?.addEventListener('click', () => moveCarousel(-1));
  document.querySelector('.carousel-next')?.addEventListener('click', () => moveCarousel(1));
}

function inicializarCadastro() {
  const btnCadastro = document.querySelector(".btnCadastro");
  if (!btnCadastro) return;

  btnCadastro.addEventListener("click", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const senha = document.getElementById("senha")?.value || "";
    const confirmarSenha = document.getElementById("confirmarSenha")?.value || "";
    const dataNascimento = document.getElementById("dataNascimento")?.value || "";
    const erroSenha = document.getElementById("erroSenha");

    if (!nome || !email || !dataNascimento || !senha || !confirmarSenha) {
      alert("Preencha todos os campos!");
      return;
    }

    if (senha !== confirmarSenha) {
      erroSenha.innerText = "As senhas não coincidem.";
      erroSenha.style.display = "block";
      return;
    }
    erroSenha.style.display = "none";

    if (isNaN(Date.parse(dataNascimento))) {
      alert("Informe uma data de nascimento válida.");
      return;
    }

    const dados = {
      usuario_nome: nome,
      usuario_email: email,
      usuario_data_nascimento: dataNascimento,
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

function inicializarLogin() {
  const btnEntrar = document.getElementById("btnEntrar");
  if (!btnEntrar) return;

  btnEntrar.addEventListener("click", async () => {
    const email = document.getElementById("emailLogin")?.value.trim() || "";
    const senha = document.getElementById("senhaLogin")?.value || "";
    const erroLogin = document.getElementById("erroLogin");

    if (!email || !senha) {
      erroLogin.innerText = "Por favor, preencha todos os campos.";
      erroLogin.style.display = "block";
      return;
    }

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const resultado = await response.json();

      if (response.ok) {
        await criarSessao(resultado.usuario_ID);
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

async function criarSessao(usuario_ID) {
  try {
    const sessaoResponse = await fetch("/api/sessoes/criar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario_ID, sessao_status: "ativa" }),
    });

    const sessaoResult = await sessaoResponse.json();

    if (sessaoResponse.ok) {
      console.log("Sessão criada com sucesso:", sessaoResult.sessao_ID);
    } else {
      console.warn("Erro ao criar sessão:", sessaoResult.message);
    }
  } catch (error) {
    console.warn("Erro na criação da sessão:", error);
  }
}
