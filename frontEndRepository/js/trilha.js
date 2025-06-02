document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://localhost:3000/exercicios');

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const exercicios = await response.json();

    if (!Array.isArray(exercicios) || exercicios.length === 0) {
      console.log('Nenhum exercício encontrado!');
      return;
    }

    const container = document.getElementById('bolinhas-container');
    container.innerHTML = ''; // limpa antes

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
  }
});
