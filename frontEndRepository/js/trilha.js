document.addEventListener('DOMContentLoaded', async () => {
  try {
    const container = document.getElementById('bolinhas-container');
    const USUARIO_ID = localStorage.getItem('loggedInUserId');

    // Remove os esqueletos de carregamento antes de tentar carregar os dados
    container.querySelectorAll('.skeleton-bolinha').forEach(skeleton => skeleton.remove());

    if (!USUARIO_ID) {
        container.innerHTML = '<p class="feedback-message error trilha-empty-message">Por favor, faça login para ver a trilha de exercícios.</p>';
        return;
    }

    const [exerciciosResponse, progressoResponse] = await Promise.all([
        fetch('/exercicios'),
        fetch(`/progresso/${USUARIO_ID}`)
    ]);
    

    if (!exerciciosResponse.ok) {
        throw new Error(`Erro HTTP ao carregar exercícios: ${exerciciosResponse.status} - ${exerciciosResponse.statusText}`);
    }
    const exercicios = await exerciciosResponse.json();

    if (!progressoResponse.ok) {
        // Se o progresso não for encontrado (404), tratar como um array vazio
        if (progressoResponse.status === 404) {
            console.warn(`Progresso para o usuário ${USUARIO_ID} não encontrado. Iniciando progresso vazio.`);
            // Continue com progresso vazio
        } else {
            throw new Error(`Erro HTTP ao carregar progresso: ${progressoResponse.status} - ${progressoResponse.statusText}`);
        }
    }
    const progresso = progressoResponse.ok ? await progressoResponse.json() : [];

    if (!Array.isArray(exercicios) || exercicios.length === 0) {
      container.innerHTML = '<p class="feedback-message info trilha-empty-message">Nenhum exercício disponível ainda. Volte mais tarde!</p>';
      return;
    }

    container.innerHTML = ''; // Limpa o container para adicionar os botões reais

    exercicios.sort((a, b) => a.posicao_trilha - b.posicao_trilha); // Garante a ordem

    exercicios.forEach(exercicio => {
      const bolinha = document.createElement('div');
      bolinha.classList.add('bolinha');
      bolinha.textContent = exercicio.posicao_trilha;
      bolinha.title = exercicio.titulo;

      // Verifica se o exercício está no progresso do usuário
      const isCompleted = progresso.some(p => p.exercicio_ID === exercicio.exercicio_ID);
      if (isCompleted) {
          bolinha.classList.add('completed');
      }

      bolinha.addEventListener('click', () => {
        window.location.href = `exercicio.html?codigo=${encodeURIComponent(exercicio.exercicio_codigo)}`;
      });

      container.appendChild(bolinha);
    });
  } catch (error) {
    console.error('Erro ao carregar os exercícios:', error);
    const container = document.getElementById('bolinhas-container');
    container.innerHTML = `<p class="feedback-message error trilha-empty-message">Erro ao carregar exercícios: ${error.message}. Tente novamente mais tarde.</p>`;
  }
});