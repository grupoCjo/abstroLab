document.addEventListener('DOMContentLoaded', async () => {
  try {
    const container = document.getElementById('bolinhas-container');
    
    // Remove os esqueletos de carregamento antes de tentar carregar os dados
    container.querySelectorAll('.skeleton-bolinha').forEach(skeleton => skeleton.remove());

    const response = await fetch('/exercicios');
    if (!response.ok) {
      // Se não houver exercícios, a API retorna um array vazio com status 200, então 404 é um erro real.
      // Se a resposta não for OK, lança um erro para o bloco catch.
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }

    const exercicios = await response.json();

    if (!Array.isArray(exercicios) || exercicios.length === 0) {
      // Alterado 'info-message' para 'feedback-message info' para reutilizar estilos globais
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

      bolinha.addEventListener('click', () => {
        window.location.href = `exercicio.html?codigo=${encodeURIComponent(exercicio.exercicio_codigo)}`;
      });

      container.appendChild(bolinha);
    });
  } catch (error) {
    console.error('Erro ao carregar os exercícios:', error);
    const container = document.getElementById('bolinhas-container');
    // Alterado 'error-message' para 'feedback-message error' para reutilizar estilos globais
    container.innerHTML = '<p class="feedback-message error trilha-empty-message">Erro ao carregar exercícios. Tente novamente mais tarde.</p>';
  }
});