<template>
  <div>
    <header>
      <nav class="navbar">
        <div class="logo">
          <a href="#" class="abstrolab-link">AbstroLab</a>
        </div>
        <ul class="nav-links">
          <li><a href="index.html">Início</a></li>
          <li><a href="index.html">Funcionalidades</a></li>
          <li><a href="index.html">Sobre</a></li>
          <li><a href="index.html">Depoimentos</a></li>
          <li><a href="index.html">Contato</a></li>
        </ul>
        <div class="hamburger" @click="toggleMenu" id="hamburger">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>
      </nav>
    </header>

    <div class="text-center">
      <h2 class="mainTitle">BEM-VINDO DE VOLTA!</h2>
    </div>

    <div class="main-container">
      <!-- Cadastro -->
      <div id="container-cadastro" class="card">
        <div class="card-body">
          <h2 class="text-center">Cadastrar-se</h2>
          <div class="line-divider my-4"></div>

          <div class="input-group">
            <i class="fa fa-user input-icon"></i>
            <input type="text" v-model="cadastro.nome" placeholder="Nome Completo" class="form-control" />
          </div>

          <div class="input-group mt-3">
            <i class="fa fa-envelope input-icon"></i>
            <input type="email" v-model="cadastro.email" placeholder="E-mail" class="form-control" />
          </div>

          <div class="input-group mt-3">
            <i class="fa fa-lock input-icon"></i>
            <input type="password" v-model="cadastro.senha" placeholder="Senha" class="form-control" />
          </div>

          <div class="input-group mt-3">
            <i class="fa fa-lock input-icon"></i>
            <input type="password" v-model="cadastro.confirmarSenha" placeholder="Confirmar Senha" class="form-control" />
          </div>

          <div v-if="senhaDiferente" style="color: red; font-size: 0.9rem;">As senhas não coincidem.</div>

          <div class="input-group mt-3">
            <i class="fa fa-calendar input-icon"></i>
            <input type="text" v-model="cadastro.idade" placeholder="Idade" class="form-control" />
          </div>

          <div class="input-group mt-3">
            <i class="fa fa-venus-mars input-icon"></i>
            <div class="gender-options">
              <label><input type="radio" value="feminino" v-model="cadastro.genero" class="gender-input" /> F</label>
              <label><input type="radio" value="masculino" v-model="cadastro.genero" class="gender-input" /> M</label>
              <label><input type="radio" value="outro" v-model="cadastro.genero" class="gender-input" /> Outro</label>
            </div>
          </div>

          <button class="btnCadastro" @click="fazerCadastro">Cadastrar-se</button>
        </div>
      </div>

      <!-- Login -->
      <div id="container-login" class="cardLogin">
        <div class="card-body">
          <div class="LoginTitle">
            <h2>Entrar</h2>
          </div>
          <div class="line-divider my-4"></div>

          <div class="input-group">
            <i class="fa fa-user input-icon"></i>
            <input type="text" v-model="login.email" placeholder="E-mail ou nome de usuário" class="form-control" />
          </div>

          <div class="input-group mt-3">
            <i class="fa fa-lock input-icon"></i>
            <input type="password" v-model="login.senha" placeholder="Senha" class="form-control" />
          </div>

          <div class="btnEntrar">
            <button class="entrarBtn" @click="fazerLogin">Entrar</button>
          </div>

          <a href="#" class="text-muted mt-2">Esqueceu sua senha?</a>
        </div>
      </div>
    </div>

    <footer class="footer">
      <p>&copy; 2025 AbstroLab. Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: "CadastroLogin",
  data() {
    return {
      cadastro: {
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        idade: "",
        genero: ""
      },
      login: {
        email: "",
        senha: ""
      }
    };
  },
  computed: {
    senhaDiferente() {
      return this.cadastro.senha && this.cadastro.confirmarSenha && this.cadastro.senha !== this.cadastro.confirmarSenha;
    }
  },
  methods: {
    fazerCadastro() {
      if (this.senhaDiferente) {
        alert("As senhas não coincidem.");
        return;
      }
      // Aqui você pode enviar os dados para o backend ou API
      console.log("Cadastro realizado:", this.cadastro);
    },
    fazerLogin() {
      // Aqui você pode validar os dados e redirecionar
      console.log("Login:", this.login);
      // Simula redirecionamento
      window.location.href = "paginaInicial.html";
    },
    toggleMenu() {
      const nav = document.querySelector(".nav-links");
      nav.classList.toggle("active");
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
@import "./style.css";
</style>
