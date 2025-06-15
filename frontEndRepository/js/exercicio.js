document.addEventListener('DOMContentLoaded', async () => {
    const tituloEl = document.getElementById('titulo');
    const enunciadoEl = document.getElementById('enunciado');
    const pictogramaEl = document.getElementById('pictograma-container');
    const alternativasEl = document.getElementById('alternativas-container');
    const verificarBtn = document.getElementById('verificar');
    const proximoBtn = document.getElementById('proximo');
    const feedbackEl = document.getElementById('feedback-container');
    const resultadoEl = document.getElementById('resultado');
    const feedbackIconEl = document.getElementById('feedback-icon');
    const progressBar = document.getElementById('progressBar');
    const voltarTrilhaBtn = document.createElement('button');

    const iconCorrect = '../img/correct.png';
    const iconIncorrect = '../img/incorrect.png';
    const iconComplete = '../img/complete.png';

    const urlParams = new URLSearchParams(window.location.search);
    const codigo = urlParams.get('codigo');
    const USUARIO_ID = localStorage.getItem('loggedInUserId');

    let todosExercicios = [];
    let exercicioAtual = null;

    voltarTrilhaBtn.id = 'voltar-trilha';
    voltarTrilhaBtn.className = 'btn-action';
    voltarTrilhaBtn.textContent = 'Voltar para a Trilha';
    voltarTrilhaBtn.style.display = 'none';
    document.querySelector('.action-buttons').appendChild(voltarTrilhaBtn);

    if (!codigo || !USUARIO_ID) {
        tituloEl.textContent = 'Erro ao carregar exercício';
        enunciadoEl.textContent = 'Código do exercício ou ID do usuário não foi encontrado na URL/sessão.';
        alternativasEl.innerHTML = '';
        pictogramaEl.innerHTML = '';
        verificarBtn.style.display = 'none';
        proximoBtn.style.display = 'none';
        voltarTrilhaBtn.style.display = 'block';
        return;
    }

    function removeSkeletons() {
        tituloEl.classList.remove('skeleton-text', 'skeleton-text-lg');
        enunciadoEl.classList.remove('skeleton-text', 'skeleton-text-md');
        pictogramaEl.classList.remove('skeleton');
        pictogramaEl.querySelector('.skeleton-image')?.remove();
        alternativasEl.querySelectorAll('.skeleton-card').forEach(card => card.remove());
        verificarBtn.classList.remove('skeleton-button');
        proximoBtn.classList.remove('skeleton-button');
    }

    async function renderizarExercicio(exercicio) {
        removeSkeletons();

        exercicioAtual = exercicio;
        tituloEl.textContent = exercicio.titulo;
        enunciadoEl.textContent = exercicio.enunciado;
        alternativasEl.innerHTML = '';

        const alternativasObj = typeof exercicio.alternativas === 'string' ? JSON.parse(exercicio.alternativas) : exercicio.alternativas;

        document.querySelectorAll('.alternativa-card').forEach(c => c.classList.remove('selected'));
        verificarBtn.disabled = true;

        Object.entries(alternativasObj).forEach(([key, alternativaTexto]) => {
            const card = document.createElement('div');
            card.className = 'alternativa-card';
            card.innerHTML = `
                <input type="radio" name="resposta" value="${alternativaTexto}" id="alt-${key}">
                <label for="alt-${key}">${alternativaTexto}</label>
            `;

            card.addEventListener('click', () => {
                document.querySelectorAll('.alternativa-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                card.querySelector('input').checked = true;
                verificarBtn.disabled = false;
            });

            alternativasEl.appendChild(card);
        });

        await buscarPictograma(exercicio.titulo);

        verificarBtn.style.display = 'block';
        proximoBtn.style.display = 'none';
        voltarTrilhaBtn.style.display = 'none';
        feedbackEl.style.display = 'none';
    }

    async function buscarPictograma(titulo) {
        if (!titulo) {
            pictogramaEl.innerHTML = '';
            return;
        }

        let palavraBusca = '';
        const palavrasChave = titulo.replace(/[?.,!]/g, '').split(" ");
        if (palavrasChave.length > 0) {
            palavraBusca = palavrasChave[palavrasChave.length - 1].toLowerCase();
            if (palavraBusca.length <= 2 && palavrasChave.length > 1) {
                palavraBusca = palavrasChave[palavrasChave.length - 2].toLowerCase();
            }
        }

        if (palavraBusca.endsWith('s') && palavraBusca.length > 3) {
            palavraBusca = palavraBusca.slice(0, -1);
        }
        if (palavraBusca.endsWith('as')) {
            palavraBusca = palavraBusca.slice(0, -2) + 'a';
        }
        if (palavraBusca.endsWith('os')) {
            palavraBusca = palavraBusca.slice(0, -2) + 'o';
        }

        try {
            const pictogramaResponse = await fetch(`/api/pictogramas/${palavraBusca}`);
            if (!pictogramaResponse.ok) {
                console.warn(`Falha ao buscar pictograma para "${palavraBusca}". Status: ${pictogramaResponse.status}`);
                pictogramaEl.innerHTML = '';
                return;
            }

            const pictogramas = await pictogramaResponse.json();
            if (pictogramas && pictogramas.length > 0 && pictogramas[0]._id) {
                const pictogramaURL = `https://api.arasaac.org/api/pictograms/${pictogramas[0]._id}?download=false`;
                pictogramaEl.innerHTML = `<img src="${pictogramaURL}" alt="Pictograma para ${titulo}">`;
            } else {
                pictogramaEl.innerHTML = '';
            }
        } catch (error) {
            console.error("Erro ao buscar pictograma:", error);
            pictogramaEl.innerHTML = '';
        }
    }

    verificarBtn.addEventListener('click', async () => {
        const selecionadaInput = document.querySelector('input[name="resposta"]:checked');
        if (!selecionadaInput) return;

        const respostaEscolhida = selecionadaInput.value;

        feedbackEl.style.display = 'flex';
        verificarBtn.style.display = 'none';
        proximoBtn.style.display = 'block';
        voltarTrilhaBtn.style.display = 'none';

        if (String(respostaEscolhida) === String(exercicioAtual.resposta_correta)) {
            feedbackEl.className = 'feedback-container correct';
            resultadoEl.textContent = 'Muito bem!';
            feedbackIconEl.src = iconCorrect;
            try {
                await fetch('/api/progresso/registrar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_ID: USUARIO_ID, exercicio_ID: exercicioAtual.exercicio_ID })
                });
            } catch (error) {
                console.error("Erro ao registrar progresso:", error);
            }
        } else {
            feedbackEl.className = 'feedback-container incorrect';
            resultadoEl.textContent = `Quase! A resposta certa era: ${exercicioAtual.resposta_correta}`;
            feedbackIconEl.src = iconIncorrect;
        }
    });

    proximoBtn.addEventListener('click', () => {
        const indiceAtualNoArray = todosExercicios.findIndex(e => String(e.exercicio_codigo) === String(codigo));

        if (indiceAtualNoArray !== -1 && indiceAtualNoArray < todosExercicios.length - 1) {
            const proximoExercicio = todosExercicios[indiceAtualNoArray + 1];
            window.location.href = `exercicio.html?codigo=${encodeURIComponent(proximoExercicio.exercicio_codigo)}`;
        } else {
            tituloEl.textContent = "Trilha Concluída!";
            pictogramaEl.innerHTML = `<img src="${iconComplete}" alt="Trilha Concluída" style="max-width:150px;">`;
            enunciadoEl.innerHTML = "<p style='font-size:1.5em; font-weight:bold;'>Parabéns! Você completou todos os exercícios desta trilha.</p>";
            alternativasEl.style.display = 'none';
            verificarBtn.style.display = 'none';
            proximoBtn.style.display = 'none';
            voltarTrilhaBtn.style.display = 'block';
        }
    });

    voltarTrilhaBtn.addEventListener('click', () => {
        window.location.href = 'trilha.html';
    });

    try {
        const todosResponse = await fetch('/exercicios');
        if (!todosResponse.ok) {
            throw new Error('Falha ao carregar lista de exercícios.');
        }
        todosExercicios = await todosResponse.json();

        if (!todosExercicios || todosExercicios.length === 0) {
            removeSkeletons();
            tituloEl.textContent = 'Nenhum Exercício Disponível';
            enunciadoEl.textContent = 'Parece que ainda não há exercícios cadastrados. Por favor, volte mais tarde.';
            alternativasEl.innerHTML = '';
            pictogramaEl.innerHTML = '';
            verificarBtn.style.display = 'none';
            proximoBtn.style.display = 'none';
            voltarTrilhaBtn.style.display = 'block';
            return;
        }

        const exercicioDetalhadoResponse = await fetch(`/api/exercicios/codigo/${codigo}`);
        if (!exercicioDetalhadoResponse.ok) {
            throw new Error('Exercício não encontrado ou erro ao carregar detalhes.');
        }
        const exercicioDetalhado = await exercicioDetalhadoResponse.json();

        const indiceAtual = todosExercicios.findIndex(e => String(e.exercicio_codigo) === String(codigo));
        if (indiceAtual !== -1 && todosExercicios.length > 0) {
            const progressoPercentual = ((indiceAtual + 1) / todosExercicios.length) * 100;
            progressBar.style.width = `${progressoPercentual}%`;
        }

        await renderizarExercicio(exercicioDetalhado);

    } catch (error) {
        console.error('Erro ao carregar o exercício:', error);
        removeSkeletons();
        tituloEl.textContent = 'Erro ao Carregar';
        enunciadoEl.innerHTML = `<p style="color:var(--incorrect-color-text);">${error.message}. Tente recarregar a página.</p>`;
        alternativasEl.style.display = 'none';
        pictogramaEl.innerHTML = '';
        verificarBtn.style.display = 'none';
        proximoBtn.style.display = 'none';
        voltarTrilhaBtn.style.display = 'block';
    }
});