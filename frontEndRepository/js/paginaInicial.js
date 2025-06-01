document.addEventListener("DOMContentLoaded", () => {
    const UI = {
        nomeUsuario: document.getElementById("nomeUsuario"),
        cardProximoExercicio: document.getElementById("card-proximo-exercicio"),
        statsCompletos: document.getElementById("stats-completos"),
        statsProgressoBarra: document.getElementById("stats-progresso-barra"),
        statsProgressoPercent: document.getElementById("stats-progresso-percent"),
        statsConquistas: document.getElementById("stats-conquistas"),
        btnSair: document.getElementById("btnSair"),

        renderUserInfo(usuario) {
            this.nomeUsuario.textContent = usuario.usuario_nome;
        },

        renderProximoExercicio(exercicio) {
            this.cardProximoExercicio.innerHTML = `
                <h2>Continue de onde parou</h2>
                <p>Seu próximo desafio é: <strong>${exercicio.titulo}</strong></p>
                <button class="btn-continuar" data-codigo="${exercicio.exercicio_codigo}">Começar Exercício</button>
            `;
            const btnContinuar = this.cardProximoExercicio.querySelector('.btn-continuar');
            btnContinuar.addEventListener('click', () => {
                window.location.href = `/exercicio?codigo=${btnContinuar.dataset.codigo}`;
            });
        },

        renderStats(progresso, totalExercicios) {
            const numCompletos = progresso.length;
            const percentual = totalExercicios > 0 ? Math.round((numCompletos / totalExercicios) * 100) : 0;

            this.statsCompletos.textContent = numCompletos;
            this.statsCompletos.classList.remove('skeleton', 'skeleton-text');

            this.statsProgressoBarra.style.width = `${percentual}%`;
            this.statsProgressoPercent.textContent = `${percentual}%`;
            this.statsProgressoPercent.classList.remove('skeleton', 'skeleton-text');

            // Lógica simples para conquistas
            this.statsConquistas.textContent = percentual > 50 ? '🏆🏅' : '🏆';
            this.statsConquistas.classList.remove('skeleton', 'skeleton-text');
        },

        renderError(message) {
            this.cardProximoExercicio.innerHTML = `<p style="color: #c62828;">${message}</p>`;
        }
    };

    const API = {
        async fetchData(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Erro na rede: ${response.statusText}`);
                }
                return await response.json();
            } catch (error) {
                console.error(`Falha ao buscar dados de ${url}:`, error);
                UI.renderError("Não foi possível carregar os dados. Tente novamente mais tarde.");
                throw error; // Propaga o erro
            }
        },

        getUsuario: (id) => API.fetchData(`/api/usuarios/${id}`),
        getProgresso: (id) => API.fetchData(`/api/progresso/${id}`),
        getExercicios: () => API.fetchData('/api/exercicios'),
        getProximoExercicio: (id) => API.fetchData(`/api/progresso/proximo/${id}`)
    };

    async function initDashboard() {
        const usuarioID = 1; 

        try {
            const [usuario, progresso, exercicios, proximoExercicio] = await Promise.all([
                API.getUsuario(usuarioID),
                API.getProgresso(usuarioID),
                API.getExercicios(),
                API.getProximoExercicio(usuarioID)
            ]);

            UI.renderUserInfo(usuario);
            UI.renderProximoExercicio(proximoExercicio);
            UI.renderStats(progresso, exercicios.length);

        } catch (error) {
            console.error("Falha ao inicializar o dashboard.", error);
        }
    }
    
    UI.btnSair.addEventListener('click', () => {
        if (confirm("Tem certeza que deseja sair?")) {
            window.location.href = 'cadastro.html';
        }
    });

    initDashboard();
});