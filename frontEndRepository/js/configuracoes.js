document.addEventListener("DOMContentLoaded", () => {
    
    const USUARIO_ID = 1;

    
    const inputNome = document.getElementById("input-nome");
    const btnSalvarNome = document.getElementById("btn-salvar-nome");
    const feedbackNome = document.getElementById("feedback-nome");
    const volumeSlider = document.getElementById("volume-slider");
    const themeOptions = document.querySelectorAll(".theme-option");
    const body = document.body;

    
    function showFeedback(element, message, type = 'success') {
        element.textContent = message;
        element.className = `feedback-message ${type}`;
        setTimeout(() => {
            element.textContent = '';
        }, 3000); 
    }

    
    btnSalvarNome.addEventListener("click", async () => {
        const novoNome = inputNome.value.trim();
        if (!novoNome) {
            showFeedback(feedbackNome, "Por favor, insira um nome.", "error");
            return;
        }

        try {
            const response = await fetch(`/api/usuarios/${USUARIO_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_nome: novoNome })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            showFeedback(feedbackNome, "Nome alterado com sucesso!", "success");

        } catch (error) {
            showFeedback(feedbackNome, `Erro: ${error.message}`, "error");
        }
    });

    
    function applyTheme(themeName) {
        
        body.className = `theme-${themeName}`;
        
        themeOptions.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });
        
        localStorage.setItem('abstrolab_theme', themeName);
    }

    themeOptions.forEach(button => {
        button.addEventListener("click", async () => {
            const selectedTheme = button.dataset.theme;
            applyTheme(selectedTheme); // Aplica imediatamente na UI

            
            try {
                await fetch(`/api/configuracoes/${USUARIO_ID}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tema: selectedTheme })
                });
            } catch (error) {
                console.error("Erro ao salvar o tema:", error);
                alert("Não foi possível salvar sua preferência de tema.");
            }
        });
    });


    volumeSlider.addEventListener("input", (e) => {
        const volumeValue = e.target.value;
        localStorage.setItem('abstrolab_volume', volumeValue);
        
    });


    function loadSettings() {
        const savedTheme = localStorage.getItem('abstrolab_theme') || 'light';
        applyTheme(savedTheme);

        const savedVolume = localStorage.getItem('abstrolab_volume') || '0.5';
        volumeSlider.value = savedVolume;
    }

    loadSettings();
});