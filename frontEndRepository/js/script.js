document.addEventListener("DOMContentLoaded", async () => {
  const themedPages = ['paginaInicial.html', 'trilha.html', 'configuracoes.html', 'exercicio.html'];
  const currentPage = window.location.pathname.split('/').pop();

  await aplicarTemaSalvo();

  const noHeaderFooterPages = ['configuracoes.html', 'paginaInicial.html', 'exercicio.html', 'trilha.html'];
  if (!noHeaderFooterPages.includes(currentPage)) {
    carregarHeaderFooter();
  }

  inicializarEventosGlobais();
  inicializarCarrossel();
  inicializarCadastro();
  inicializarLogin();
});

function carregarHeaderFooter() {
  fetch('/views/header.html')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html);
      setupHamburgerMenu();
    })
    .catch(error => console.error("Erro ao carregar o header:", error));

  fetch('/views/footer.html')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);
    })
    .catch(error => console.error("Erro ao carregar o footer:", error));
}

function setupHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
  }
}

function inicializarEventosGlobais() {
  const beginBtn = document.getElementById("begin");
  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
      window.location.href = "../views/cadastro.html";
    });
  }
}

function inicializarCarrossel() {
  const carouselItems = document.querySelector('.carousel-items');
  if (!carouselItems) return;

  let index = 0;
  const featureCards = carouselItems.querySelectorAll('.feature-card');
  const totalItems = featureCards.length;

  const updateCarousel = () => {
    if (featureCards.length === 0) return;
    const itemStyle = getComputedStyle(featureCards[0]);
    const itemWidth = featureCards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carouselItems).getPropertyValue('gap')) || 0;
    
    const carouselWidth = carouselItems.parentElement.offsetWidth;
    const itemsInView = Math.floor(carouselWidth / (itemWidth + gap));
    const maxIndex = Math.max(0, totalItems - itemsInView);
    
    index = Math.min(index, maxIndex);
    index = Math.max(0, index);

    carouselItems.style.transform = `translateX(-${index * (itemWidth + gap)}px)`;
  };

  const moveCarousel = (step) => {
    const carouselWidth = carouselItems.parentElement.offsetWidth;
    const itemWidth = featureCards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carouselItems).getPropertyValue('gap')) || 0;
    const itemsInView = Math.floor(carouselWidth / (itemWidth + gap));

    let newIndex = index + step;

    if (newIndex < 0) {
        newIndex = 0;
    } else if (newIndex > totalItems - itemsInView) {
        newIndex = totalItems - itemsInView;
    }
    
    if (index !== newIndex) {
        index = newIndex;
        updateCarousel();
    }
  };

  document.querySelector('.carousel-prev')?.addEventListener('click', () => moveCarousel(-1));
  document.querySelector('.carousel-next')?.addEventListener('click', () => moveCarousel(1));

  window.addEventListener('resize', updateCarousel);
  updateCarousel();
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
    const genero = document.querySelector('input[name="genero"]:checked')?.value || "";
    const erroSenha = document.getElementById("erroSenha");

    if (!nome || !email || !dataNascimento || !senha || !confirmarSenha || !genero) {
      erroSenha.innerText = "Por favor, preencha todos os campos obrigatórios.";
      erroSenha.style.display = "block";
      return;
    }

    if (senha !== confirmarSenha) {
      erroSenha.innerText = "As senhas não coincidem.";
      erroSenha.style.display = "block";
      return;
    }
    if (senha.length < 6) {
        erroSenha.innerText = "A senha deve ter no mínimo 6 caracteres.";
        erroSenha.style.display = "block";
        return;
    }
    erroSenha.style.display = "none";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        erroSenha.innerText = "E-mail inválido!";
        erroSenha.style.display = "block";
        return;
    }

    if (isNaN(Date.parse(dataNascimento))) {
      erroSenha.innerText = "Informe uma data de nascimento válida.";
      erroSenha.style.display = "block";
      return;
    }

    const dados = {
      usuario_nome: nome,
      usuario_email: email,
      usuario_data_nascimento: dataNascimento,
      usuario_senha: senha,
      usuario_genero: genero
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
        const loginResponse = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: dados.usuario_email, senha: senha }),
        });
        const loginResult = await loginResponse.json();

        if (loginResponse.ok) {
            localStorage.setItem('loggedInUserId', loginResult.usuario_ID);
            await criarSessao(loginResult.usuario_ID);
            sessionStorage.removeItem('hasVisitedDashboard');
            window.location.href = "paginaInicial.html";
        } else {
            alert("Cadastro realizado, mas falha no login automático. Por favor, faça login manualmente.");
            window.location.href = "cadastro.html";
        }
      } else {
        erroSenha.innerText = resultado.message || "Erro desconhecido ao cadastrar.";
        erroSenha.style.display = "block";
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      erroSenha.innerText = "Erro ao conectar com o servidor. Tente novamente.";
      erroSenha.style.display = "block";
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
        localStorage.setItem('loggedInUserId', resultado.usuario_ID);
        await criarSessao(resultado.usuario_ID);
        alert("Login efetuado com sucesso!");
        sessionStorage.removeItem('hasVisitedDashboard');
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
      body: JSON.stringify({ usuario_ID }),
    });

    const sessaoResult = await sessaoResponse.json();

    if (sessaoResponse.ok) {
      localStorage.setItem('loggedInSessionId', sessaoResult.sessao_ID);
    } else {
      console.warn("Erro ao criar sessão:", sessaoResult.message);
    }
  } catch (error) {
    console.warn("Erro na criação da sessão:", error);
  }
}

async function aplicarTemaSalvo() {
    const body = document.body;
    const USUARIO_ID = localStorage.getItem('loggedInUserId');
    let savedTheme = localStorage.getItem('abstrolab_theme');

    const themedPages = ['paginaInicial.html', 'trilha.html', 'configuracoes.html', 'exercicio.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (themedPages.includes(currentPage)) {
        if (USUARIO_ID) {
            try {
                const response = await fetch(`/api/configuracoes/${USUARIO_ID}`);
                if (response.ok) {
                    const config = await response.json();
                    savedTheme = config.tema;
                    localStorage.setItem('abstrolab_theme', savedTheme);
                } else if (response.status === 404) {
                    savedTheme = 'light';
                    localStorage.setItem('abstrolab_theme', savedTheme);
                } else {
                    console.error("Erro ao buscar configurações do usuário:", await response.text());
                    if (!savedTheme) savedTheme = 'light';
                }
            } catch (error) {
                console.error("Erro na comunicação com a API de configurações:", error);
                if (!savedTheme) savedTheme = 'light';
            }
        } else {
            if (!savedTheme) savedTheme = 'light';
        }
        body.className = body.className.split(' ').filter(c => !c.startsWith('theme-')).join(' ');
        body.classList.add(`theme-${savedTheme}`);
        if (currentPage === 'configuracoes.html') {
            const themeOptions = document.querySelectorAll(".theme-option");
            themeOptions.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === savedTheme);
            });
        }
    } else {
        body.className = '';
    }
}