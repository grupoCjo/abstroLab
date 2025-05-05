// Função para carregar os exercícios e criar as bolinhas
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/exercicios');
        const exercicios = await response.json();

        if (exercicios.length === 0) {
            console.log('Nenhum exercício encontrado!');
            return;
        }

        // Pega o container onde as bolinhas vão ser adicionadas
        const container = document.getElementById('bolinhas-container');

        // Para cada exercício, criamos uma bolinha
        exercicios.forEach(exercicio => {
            // Cria um botão (bolinha) para cada exercício
            const bolinha = document.createElement('div');
            bolinha.classList.add('bolinha');
            bolinha.textContent = exercicio.posicao_trilha;

            // Adiciona evento de clique para redirecionar ao exercício
            bolinha.addEventListener('click', () => {
              window.location.href = `exercicio.html?codigo=${exercicio.exercicio_codigo}`;
            });

            // Adiciona a bolinha ao container
            container.appendChild(bolinha);
        });
    } catch (error) {
        console.error('Erro ao carregar os exercícios:', error);
    }
});
