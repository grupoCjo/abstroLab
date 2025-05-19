<template>
  <div id="app">
    <header>
      <nav class="navbar">
        <div class="logo">
          <a href="#">AbstroLab</a>
        </div>
        <ul class="nav-links" :class="{ 'active': menuActive }">
          <li><a href="#inicio">Início</a></li>
          <li><a href="#funcionalidades">Funcionalidades</a></li>
          <li><a href="trilha.html">Trilha</a></li>
          <li><a href="#sobre">Sobre</a></li>
          <li><a href="#depoimentos">Depoimentos</a></li>
          <li><a href="#contato">Contato</a></li>
        </ul>
        <div class="hamburger" @click="toggleMenu" id="hamburger">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>
      </nav>
    </header>

    <section class="hero" id="inicio">
      <div class="hero-content">
        <h1>Bem-vindo ao AbstroLab!</h1>
        <p>Transformando o aprendizado de abstração matemática para crianças autistas.</p>
        <div class="buttons">
          <button class="btn-primary"><a href="cadastro.html">Entrar</a></button>
          <button class="btn-secondary"><a href="cadastro.html">Cadastrar-se</a></button>
        </div>
      </div>
    </section>

    <section class="features" id="funcionalidades">
      <div class="carousel-container">
        <div class="carousel">
          <div class="carousel-items" :style="{ transform: 'translateX(' + (-carouselIndex * 100) + '%)' }">
            <div
              class="feature-card"
              v-for="(feature, index) in features"
              :key="index"
            >
              <i :class="feature.icon"></i>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>
          <button class="carousel-prev" @click="moveCarousel(-1)">&#10094;</button>
          <button class="carousel-next" @click="moveCarousel(1)">&#10095;</button>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p>&copy; 2025 AbstroLab. Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuActive: false,
      carouselIndex: 0,
      features: [
        {
          title: "Aprendizado Interativo",
          description:
            "Jogos que ajudam as crianças a entenderem conceitos matemáticos de maneira divertida.",
          icon: "fas fa-gamepad",
        },
        {
          title: "Interação e Suporte",
          description:
            "Pais e educadores podem acompanhar o progresso do aprendizado.",
          icon: "fas fa-users",
        },
        {
          title: "Customização",
          description:
            "As atividades estão separadas em trilhas com níveis graduais.",
          icon: "fas fa-cogs",
        },
      ],
    };
  },
  methods: {
    toggleMenu() {
      this.menuActive = !this.menuActive;
    },
    moveCarousel(step) {
      const total = this.features.length;
      this.carouselIndex = (this.carouselIndex + step + total) % total;
    },
  },
};
</script>

<style scoped>
/* Reset e Base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
}

body {
    background: linear-gradient(to right, #f8c6d2, #e0f7fa);
    color: #333;
    text-align: center;
    padding: 50px 10px;
    animation: fadeIn 1s ease-in-out;
}

@keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
}

/* Navbar */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 50px;
    background: linear-gradient(to right, #fb053e77, #06e2ff57);
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-top: -1.2cm;
}

.nav-links {
    list-style: none;
    display: flex;
    gap: 30px;
    margin: 1em 0;
}

.nav-links li a {
    color: #5d6a79;
    text-decoration: none;
    font-weight: bold;
    font-size: 18px;
}

.abstrolab-link {
    font-weight: bold;
    color: #fff;
    font-size: 35px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* Hero Section */
.hero {
    background: inherit;
    padding: 80px 20px;
}

.hero h1, .hero p {
    color: #5d6a79;
}

.hero h1 {
    font-size: 3.5em;
    margin-bottom: 20px;
}

.hero p {
    font-size: 1.5em;
    margin-bottom: 30px;
}

/* Botões */
.btn, .entrarBtn, .btnCadastro, .btn-primary, .btn-secondary {
    padding: 12px 25px;
    font-size: 1.3em;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    margin: 10px 0;
    transition: transform 0.3s ease;
    font-weight: lighter;
}

.btn, .entrarBtn, .btnCadastro, .btn-primary {
    background-color: #ffb3b3;
    color: white;
}

.btn-secondary {
    background-color: #c1e1e6;
    margin-left: 10px;
    color: white;
}

.btn:hover, .entrarBtn:hover, .btnCadastro:hover, .btn-primary:hover, .btn-secondary:hover {
    transform: scale(1.1);
}

/* Carousel */
.carousel-container {
    position: relative;
    max-width: 100%;
    margin: 40px auto;
    padding: 20px 0;
}

.carousel {
    position: relative;
    overflow: hidden;
}

.carousel-items {
    display: flex;
    transition: transform 0.5s ease-in-out;
}

.feature-card {
    flex: 0 0 100%;
    max-width: 100%;
    padding: 30px;
    margin: 0 15px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 15px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: transform 0.3s ease-in-out;
}

.feature-card i {
    font-size: 50px;
    margin-bottom: 20px;
    color: #ffb3b3;
}

.feature-card h3, .feature-card p {
    color: #5d6a79;
}

.carousel-prev, .carousel-next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    padding: 15px;
    font-size: 25px;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.3s;
}

.carousel-prev:hover, .carousel-next:hover {
    background-color: rgba(0, 0, 0, 0.8);
}

.carousel-prev { left: 10px; }
.carousel-next { right: 10px; }

/* Footer */
.footer, footer {
    width: 100%;
    background-color: #333;
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Cadastro/Login Cards */
.main-container {
    display: flex;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    gap: 20px;
    animation: slideIn 0.8s ease-out;
}

@keyframes slideIn {
    0% { transform: translateX(-50px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
}

.card, .cardLogin {
    width: 48%;
    padding: 50px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card-body, .cardLogin-body {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.mainTitle {
    font-size: 4rem;
    color: #333;
    margin: 2cm 0 20px;
}

h2 {
    font-size: 1.6rem;
    color: #333;
    text-align: center;
    margin-bottom: 20px;
}

.LoginTitle h2 {
    margin-top: 10px;
}

.input-group {
    margin-bottom: 20px;
    position: relative;
}

.input-group label {
    font-size: 1rem;
    color: #333;
    display: flex;
    align-items: center;
}

.input-group input {
    width: 100%;
    padding: 12px 12px 12px 40px;
    border-radius: 30px;
    border: 1px solid #ccc;
    font-size: 1rem;
    transition: 0.3s;
}

.input-group input:focus {
    border-color: #ff7f7f;
    transform: scale(1.05);
}

.input-icon {
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    color: #ff7f7f;
    font-size: 1.4rem;
}

/* Gênero */
.gender-options {
    display: flex;
    gap: 15px;
    font-size: 1rem;
    color: #333;
    justify-content: center;
    margin-top: 10px;
}

.gender-options label {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.gender-input {
    margin-right: 5px;
    transform: scale(1.2);
}

/* Outras */
.line-divider {
    height: 2px;
    background-color: #eee;
    margin: 20px 0;
}

.d-flex {
    display: flex;
    justify-content: space-between;
}

.bolinha {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #3498db;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.bolinha:hover { background-color: #2980b9; }
.bolinha:active { background-color: #1abc9c; }

#imagem {
    width: 100%;
    height: 200px;
    background-color: #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem 0;
    border-radius: 8px;
}

.alternativa {
    display: block;
    width: 100%;
    padding: 1rem;
    margin: 0.5rem 0;
    border: 1px solid #ccc;
    border-radius: 6px;
    background-color: #fff;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.alternativa:hover {
    background-color: #f0f0f0;
}

.alternativa.selecionada {
    background-color: #d0eaff;
    border-color: #2196f3;
}

#resultado {
    margin-top: 1rem;
    font-weight: bold;
}

button#verificar {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

button#verificar:hover {
    background-color: #45a049;
}

/* Responsivo */
@media (max-width: 768px) {
    .navbar { flex-direction: column; }
    .nav-links {
        display: none;
        flex-direction: column;
        position: absolute;
        top: 70px;
        right: 0;
        background: rgba(0, 0, 0, 0.9);
        padding: 20px;
        width: 100%;
        border-radius: 10px;
        gap: 20px;
    }

    .nav-links.active {
        display: flex;
    }

    .hamburger {
        display: block;
        cursor: pointer;
    }

    .hamburger .bar {
        width: 25px;
        height: 3px;
        background-color: white;
        margin: 5px 0;
        transition: 0.3s;
    }

    .main-container {
        flex-direction: column;
    }

    .card, .cardLogin {
        width: 100%;
        margin-bottom: 20px;
    }

    .hero {
        padding: 60px 20px;
    }

    .btn {
        font-size: 1rem;
        padding: 10px;
    }

    h2 {
        font-size: 1.4rem;
    }

    .gender-options {
        flex-direction: column;
        align-items: center;
    }
}

</style>
