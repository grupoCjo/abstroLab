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

    const iconCorrect = 'https://cdn-icons-png.flaticon.com/512/4315/4315445.png'; // Ícone de "joinha"
    const iconIncorrect = 'https://cdn-icons-png.flaticon.com/512/4315/4315408.png'; // Ícone de "negativo"
    const iconComplete = 'https://cdn-icons-png.flaticon.com/512/2920/2920325.png'; // Ícone de "troféu"

    const urlParams = new URLSearchParams(window.location.search);
    const codigo = urlParams.get('codigo');

    if (!codigo) {
        tituloEl.textContent = 'Erro';
        enunciadoEl.textContent = 'Código do exercício não foi encontrado na URL.';
        return;
    }

    let todosExercicios = [];
    let exercicioAtual = null;

    try {
        const todosResponse = await fetch('http://localhost:3000/exercicios');
        todosExercicios = await todosResponse.json();
        
        const indiceAtual = todosExercicios.findIndex(e => e.exercicio_codigo === codigo);
        exercicioAtual = todosExercicios[indiceAtual];

        if (!exercicioAtual) {
            throw new Error('Exercício não encontrado.');
        }

        const progressoPercentual = ((indiceAtual + 1) / todosExercicios.length) * 100;
        progressBar.style.width = `${progressoPercentual}%`;

        const response = await fetch(`http://localhost:3000/exercicios/codigo/${codigo}`);
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.message);
        }
        const exercicio = await response.json();
        
        renderizarExercicio(exercicio);

    } catch (error) {
        console.error('Erro ao carregar o exercício:', error);
        tituloEl.textContent = 'Erro ao Carregar';
        enunciadoEl.textContent = error.message;
    }

    async function renderizarExercicio(exercicio) {
        tituloEl.textContent = exercicio.titulo;
        enunciadoEl.textContent = exercicio.enunciado;

        alternativasEl.innerHTML = '';
        
        const alternativas = [
            exercicio.alternativa_1,
            exercicio.alternativa_2,
            exercicio.alternativa_3,
            exercicio.alternativa_4,
        ];

        alternativas.forEach((alt, index) => {
            const card = document.createElement('div');
            card.className = 'alternativa-card';
            card.innerHTML = `<input type="radio" name="resposta" id="alt${index + 1}" value="${index + 1}">
                              <label for="alt${index + 1}">${alt}</label>`;
            
            card.addEventListener('click', () => {
                document.querySelectorAll('.alternativa-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                card.querySelector('input').checked = true;
                verificarBtn.disabled = false;
            });

            alternativasEl.appendChild(card);
        });


        buscarPictograma(exercicio.titulo);
    }

    async function buscarPictograma(titulo) {
        const palavrasChave = titulo.replace(/[?.,!]/g, '').split(" ");
        let palavraBusca = palavrasChave[palavrasChave.length - 1];
        if (palavraBusca.length <= 2 && palavrasChave.length > 1) {
            palavraBusca = palavrasChave[palavrasChave.length - 2];
        }

        try {
            const pictogramaResponse = await fetch(`http://localhost:3000/api/pictogramas/${palavraBusca}`);
            const pictogramas = await pictogramaResponse.json();
            if (pictogramas.length > 0) {
                const pictogramaURL = `https://api.arasaac.org/v1/pictograms/${pictogramas[0]._id}`;
                pictogramaEl.innerHTML = `<img src="${pictogramaURL}" alt="${titulo}">`;
            }
        } catch (error) {
            console.error("Erro ao buscar pictograma:", error);
        }
    }

    verificarBtn.addEventListener('click', () => {
        const selecionada = document.querySelector('input[name="resposta"]:checked');
        if (!selecionada) return;

        const respostaEscolhida = Number(selecionada.value);
        const respostaCorreta = exercicioAtual.resposta_correta;
        
        const alternativasDoExercicio = JSON.parse(exercicioAtual.alternativas);
        const valorRespostaCorreta = exercicioAtual.resposta_correta;
        const chaveCorreta = Object.keys(alternativasDoExercicio).find(key => alternativasDoExercicio[key] === valorRespostaCorreta);

        feedbackEl.style.display = 'flex';
        verificarBtn.style.display = 'none';
        proximoBtn.style.display = 'block';

        if (respostaEscolhida === Number(chaveCorreta)) {
            feedbackEl.className = 'feedback-container correct';
            resultadoEl.textContent = 'Muito bem!';
            feedbackIconEl.src = iconCorrect;
        } else {
            feedbackEl.className = 'feedback-container incorrect';
            resultadoEl.textContent = `Quase! A resposta certa era: ${valorRespostaCorreta}`;
            feedbackIconEl.src = iconIncorrect;
        }
    });

    proximoBtn.addEventListener('click', () => {
        const indiceAtual = todosExercicios.findIndex(e => e.exercicio_codigo === codigo);

        if (indiceAtual < todosExercicios.length - 1) {
            const proximoExercicio = todosExercicios[indiceAtual + 1];
            window.location.href = `exercicio.html?codigo=${proximoExercicio.exercicio_codigo}`;
        } else {
            
            tituloEl.textContent = "Trilha Concluída!";
            pictogramaEl.innerHTML = `<img src="${iconComplete}" alt="Trilha Concluída">`;
            enunciadoEl.textContent = "Parabéns! Você completou todos os exercícios desta trilha.";
            alternativasEl.style.display = 'none';
            verificarBtn.style.display = 'none';
            proximoBtn.textContent = 'Voltar para a Trilha';
            proximoBtn.addEventListener('click', () => { window.location.href = 'trilha.html'; });
        }
    });
});