document.addEventListener("DOMContentLoaded", () => {
  const UI = {
    userNameElement: document.getElementById("user-name"),
    userEmailElement: document.getElementById("user-email"),
    userAvatarElement: document.getElementById("user-avatar"),
    totalExercisesElement: document.getElementById("total-exercises"),
    completedExercisesElement: document.getElementById("completed-exercises"),
    exerciseProgressElement: document.getElementById("exercise-progress"),
    nextExerciseTitleElement: document.getElementById("next-exercise-title"),
    nextExerciseDescriptionElement: document.getElementById(
      "next-exercise-description"
    ),
    btnIniciarExercicio: document.getElementById("btn-iniciar-exercicio"),
    messageArea: document.getElementById("message-area"),
    btnSair: document.getElementById("btnSair"),
    navLinks: document.querySelectorAll(".sidebar-link"),
    welcomeOverlay: document.getElementById("welcome-overlay"),
    startJourneyBtn: document.getElementById("btn-start-journey"),

    renderUserInfo(usuario) {
      if (this.userNameElement) {
        this.userNameElement.textContent = usuario.usuario_nome || "Usuário";
        this.userNameElement.classList.remove("skeleton-text", "skeleton-text-lg");
      }
      if (this.userEmailElement) {
        this.userEmailElement.textContent = usuario.usuario_email || "";
        this.userEmailElement.classList.remove("skeleton-text", "skeleton-text-md");
      }
        
      let avatarPath = "../img/boy.jpg";
      if (usuario.usuario_genero === "feminino") {
        avatarPath = "../img/girl.jpg";
      } else if (usuario.usuario_genero === "outro") {
        avatarPath = "../img/neutral.png";
      }
      if (this.userAvatarElement) {
        this.userAvatarElement.src = avatarPath;
        document.getElementById("user-avatar-container").classList.remove("skeleton");
      }
    },

    renderStats(progresso, totalExercicios) {
      const completedCount = progresso ? progresso.length : 0;
      if (this.totalExercisesElement) {
        this.totalExercisesElement.textContent = totalExercicios;
        this.totalExercisesElement.classList.remove("skeleton-text", "skeleton-text-sm");
      }
      if (this.completedExercisesElement) {
        this.completedExercisesElement.textContent = completedCount;
        this.completedExercisesElement.classList.remove("skeleton-text", "skeleton-text-sm");
      }

      if (totalExercicios > 0 && this.exerciseProgressElement) {
        const percentage = (completedCount / totalExercicios) * 100;
        this.exerciseProgressElement.style.width = `${percentage}%`;
        const percentTextElement = document.getElementById(
          "stats-progresso-percent"
        );
        if (percentTextElement) {
          percentTextElement.textContent = `${Math.round(percentage)}%`;
          percentTextElement.classList.remove("skeleton-text", "skeleton-text-sm");
        }
      } else if (this.exerciseProgressElement) {
        this.exerciseProgressElement.style.width = `0%`;
        const percentTextElement = document.getElementById(
          "stats-progresso-percent"
        );
        if (percentTextElement) {
          percentTextElement.textContent = `0%`;
          percentTextElement.classList.remove("skeleton-text", "skeleton-text-sm");
        }
      }
      document.getElementById("stats-conquistas").classList.remove("skeleton-text", "skeleton-text-sm");
    },

    renderProximoExercicio(exercicio) {
      if (exercicio && !exercicio.trilhaConcluida && exercicio.exercicio_ID) {
        if (this.nextExerciseTitleElement)
          this.nextExerciseTitleElement.textContent = exercicio.titulo;
        if (this.nextExerciseDescriptionElement)
          this.nextExerciseDescriptionElement.textContent = exercicio.descricao;
        if (this.btnIniciarExercicio) {
          this.btnIniciarExercicio.onclick = () => {
            window.location.href = `exercicio.html?codigo=${exercicio.exercicio_codigo}`;
          };
          this.btnIniciarExercicio.textContent = "Iniciar Exercício";
          this.btnIniciarExercicio.style.display = "inline-block";
          this.btnIniciarExercicio.classList.remove("skeleton-button");
        }
      } else if (exercicio && exercicio.trilhaConcluida) {
        if (this.nextExerciseTitleElement)
          this.nextExerciseTitleElement.textContent = "Trilha Concluída!";
        if (this.nextExerciseDescriptionElement)
          this.nextExerciseDescriptionElement.textContent =
            "Parabéns! Você completou todos os exercícios da trilha.";
        if (this.btnIniciarExercicio) {
            this.btnIniciarExercicio.textContent = "Ver Trilha Completa";
            this.btnIniciarExercicio.onclick = () => {
                window.location.href = `trilha.html`;
            };
            this.btnIniciarExercicio.style.display = "inline-block";
            this.btnIniciarExercicio.classList.remove("skeleton-button");
        }
      }
      else {
        if (this.nextExerciseTitleElement)
          this.nextExerciseTitleElement.textContent =
            "Nenhum Exercício Disponível!";
        if (this.nextExerciseDescriptionElement)
          this.nextExerciseDescriptionElement.textContent =
            "Ops! Parece que não encontramos a sua jornada, mas fique tranquilo(a)! Em breve você poderá voltar a aprender conosco.";
        if (this.btnIniciarExercicio)
          this.btnIniciarExercicio.style.display = "none";
      }
      if (this.nextExerciseTitleElement)
        this.nextExerciseTitleElement.classList.remove(
          "skeleton-text",
          "skeleton-text-lg"
        );
      if (this.nextExerciseDescriptionElement)
        this.nextExerciseDescriptionElement.classList.remove(
          "skeleton-text",
          "skeleton-text-md"
        );
    },

    renderError(message) {
      if (this.messageArea) {
        this.messageArea.textContent = message;
        this.messageArea.style.display = "block";
      }
    },

    clearMessages() {
      if (this.messageArea) {
        this.messageArea.textContent = "";
        this.messageArea.style.display = "none";
      }
    },
  };

  const API = {
    async fetchData(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          if (url.includes("/exercicios") && response.status === 404) {
             return [];
          }
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Erro na rede: ${response.statusText}`
          );
        }
        const text = await response.text();
        return text ? JSON.parse(text) : null;
      } catch (error) {
        console.error(`Falha ao buscar dados de ${url}:`, error);
        if (url.includes("/exercicios")) {
          return [];
        }
        UI.renderError(`Não foi possível carregar os dados. Tente novamente.`);
        throw error;
      }
    },
    getUsuario: (id) => API.fetchData(`/api/usuarios/${id}`),
    getProgresso: (id) => API.fetchData(`/progresso/${id}`),
    getExercicios: () => API.fetchData("/exercicios"),
    getProximoExercicio: (id) => API.fetchData(`/api/progresso/proximo/${id}`),
  };

  async function initDashboardData() {
    const usuarioID = localStorage.getItem("loggedInUserId");

    if (!usuarioID) {
      UI.renderError(
        "Usuário não logado. Redirecionando para a página de cadastro."
      );
      setTimeout(() => {
        window.location.href = "cadastro.html";
      }, 2000);
      return;
    }

    try {
      UI.clearMessages();

      const [usuario, progresso, exercicios, proximoExercicio] = await Promise.all([
        API.getUsuario(usuarioID),
        API.getProgresso(usuarioID),
        API.getExercicios(),
        API.getProximoExercicio(usuarioID),
      ]);

      if (usuario) UI.renderUserInfo(usuario);
      else UI.renderError("Não foi possível carregar informações do usuário.");

      const totalExercicios = exercicios ? exercicios.length : 0;
      if (progresso) UI.renderStats(progresso, totalExercicios);
      else UI.renderStats([], totalExercicios);

      UI.renderProximoExercicio(proximoExercicio);

    } catch (error) {
      console.error("Falha ao carregar dados do dashboard:", error);
      UI.renderError(
        "Erro ao carregar dados do dashboard. Por favor, tente novamente."
      );
      UI.userNameElement?.classList.remove("skeleton-text", "skeleton-text-lg");
      UI.userEmailElement?.classList.remove("skeleton-text", "skeleton-text-md");
      document.getElementById("user-avatar-container")?.classList.remove("skeleton");
      UI.totalExercisesElement?.classList.remove("skeleton-text", "skeleton-text-sm");
      UI.completedExercisesElement?.classList.remove("skeleton-text", "skeleton-text-sm");
      document.getElementById("stats-progresso-percent")?.classList.remove("skeleton-text", "skeleton-text-sm");
      document.getElementById("stats-conquistas")?.classList.remove("skeleton-text", "skeleton-text-sm");
      UI.nextExerciseTitleElement?.classList.remove("skeleton-text", "skeleton-text-lg");
      UI.nextExerciseDescriptionElement?.classList.remove("skeleton-text", "skeleton-text-md");
      UI.btnIniciarExercicio?.classList.remove("skeleton-button");
    }
  }

  const hasVisitedDashboard = sessionStorage.getItem('hasVisitedDashboard');
  if (!hasVisitedDashboard) {
      UI.welcomeOverlay.classList.remove('hidden');
  } else {
      UI.welcomeOverlay.classList.add('hidden');
  }

  UI.startJourneyBtn.addEventListener("click", () => {
    UI.welcomeOverlay.classList.add("hidden");
    sessionStorage.setItem('hasVisitedDashboard', 'true');
  });

  UI.btnSair.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja sair?")) {
      localStorage.removeItem("loggedInUserId");
      localStorage.removeItem("loggedInSessionId");
      sessionStorage.removeItem('hasVisitedDashboard');
      window.location.href = "cadastro.html";
    }
  });

  initDashboardData();
});