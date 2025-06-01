document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/exercicios');
        const exercicios = await response.json();

        if (exercicios.length === 0) {
            console.log('Nenhum exercício encontrado!');
            return;
        }

        const container = document.getElementById('bolinhas-container');
        exercicios.forEach(exercicio => {
            const bolinha = document.createElement('div');
            bolinha.classList.add('bolinha');
            bolinha.textContent = exercicio.posicao_trilha;
            bolinha.title = exercicio.titulo;

            bolinha.addEventListener('click', () => {
                window.location.href = `exercicio.html?codigo=${exercicio.exercicio_codigo}`;
            });

            container.appendChild(bolinha);
        });
    } catch (error) {
        console.error('Erro ao carregar os exercícios:', error);
    }
});