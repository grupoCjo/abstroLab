document.addEventListener("DOMContentLoaded", async () => {

    const inputNome = document.getElementById("input-nome");
    const btnSalvarNome = document.getElementById("btn-salvar-nome");
    const feedbackNome = document.getElementById("feedback-nome");
    const themeOptions = document.querySelectorAll(".theme-option");
    const body = document.body;
    const btnSalvarAlteracoes = document.getElementById("btn-salvar-alteracoes");
    const feedbackGeral = document.getElementById("feedback-geral");

    const USUARIO_ID = localStorage.getItem('loggedInUserId');
    if (!USUARIO_ID) {
        alert("Usuário não logado. Redirecionando para a página de cadastro.");
        window.location.href = 'cadastro.html';
        return;
    }

    let currentTheme = localStorage.getItem('abstrolab_theme') || 'light';

    function showFeedback(element, message, type = 'success') {
        element.textContent = message;
        element.className = `feedback-message ${type}`;
        element.style.display = 'block';
        setTimeout(() => {
            element.textContent = '';
            element.style.display = 'none';
        }, 3000);
    }

    async function loadUserName() {
        try {
            const response = await fetch(`/api/usuarios/${USUARIO_ID}`);
            if (response.ok) {
                const usuario = await response.json();
                inputNome.value = usuario.usuario_nome;
            } else {
                console.error("Erro ao carregar nome do usuário:", await response.text());
            }
        } catch (error) {
            console.error("Erro na comunicação para carregar nome do usuário:", error);
        }
    }
    loadUserName();

    btnSalvarNome.addEventListener("click", async () => {
        const novoNome = inputNome.value.trim();
        if (!novoNome) {
            showFeedback(feedbackNome, "Por favor, insira um nome.", "error");
            return;
        }
        showFeedback(feedbackNome, "Nome pronto para ser salvo! Clique em 'Salvar Alterações'.", "info");
    });

    function applyTheme(themeName) {
        body.className = '';
        body.classList.add(`theme-${themeName}`);
        themeOptions.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });
        currentTheme = themeName;
    }

    themeOptions.forEach(button => {
        button.addEventListener("click", () => {
            const selectedTheme = button.dataset.theme;
            applyTheme(selectedTheme);
        });
    });

    btnSalvarAlteracoes.addEventListener("click", async () => {
        const novoNome = inputNome.value.trim();
        let nameSaved = false;
        let themeSaved = false;

        if (novoNome) {
            try {
                const response = await fetch(`/api/usuarios/${USUARIO_ID}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_nome: novoNome })
                });
                if (response.ok) {
                    nameSaved = true;
                    showFeedback(feedbackNome, "Nome salvo!", "success");
                } else {
                    const errorResult = await response.json();
                    showFeedback(feedbackNome, `Erro ao salvar nome: ${errorResult.message}`, "error");
                }
            } catch (error) {
                showFeedback(feedbackNome, `Erro de rede ao salvar nome.`, "error");
            }
        } else {
            showFeedback(feedbackNome, "Nome não pode ser vazio.", "error");
        }

        try {
            const response = await fetch(`/api/configuracoes/${USUARIO_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tema: currentTheme })
            });
            if (response.ok) {
                themeSaved = true;
                localStorage.setItem('abstrolab_theme', currentTheme);
            } else {
                const errorResult = await response.json();
                showFeedback(feedbackGeral, `Erro ao salvar tema: ${errorResult.message}`, "error");
            }
        } catch (error) {
            showFeedback(feedbackGeral, `Erro de rede ao salvar tema.`, "error");
        }

        if (nameSaved && themeSaved) {
            showFeedback(feedbackGeral, "Todas as alterações salvas com sucesso!", "success");
        } else if (nameSaved) {
            showFeedback(feedbackGeral, "Nome salvo, mas houve erro ao salvar o tema.", "error");
        } else if (themeSaved) {
            showFeedback(feedbackGeral, "Tema salvo, mas houve erro ao salvar o nome.", "error");
        } else {
            showFeedback(feedbackGeral, "Nenhuma alteração foi salva.", "error");
        }
    });

    async function loadUserSettings() {
        try {
            const response = await fetch(`/api/configuracoes/${USUARIO_ID}`);
            if (response.ok) {
                const config = await response.json();
                applyTheme(config.tema);
            } else if (response.status === 404) {
                applyTheme('light');
            } else {
                console.error("Erro ao carregar configurações do usuário:", await response.text());
                const savedTheme = localStorage.getItem('abstrolab_theme') || 'light';
                applyTheme(savedTheme);
            }
        } catch (error) {
            console.error("Erro ao carregar configurações do usuário:", error);
            const savedTheme = localStorage.getItem('abstrolab_theme') || 'light';
            applyTheme(savedTheme);
        }
    }

    loadUserSettings();
});