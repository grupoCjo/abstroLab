document.addEventListener('DOMContentLoaded', () => {
  const codigo = obterCodigoDaURL();  // Obtém o código ou o ID da URL
  const endpoint = `http://localhost:3000/exercicios/${codigo}`;
  const alternativasDiv = document.getElementById('alternativas');
  let alternativaSelecionada = null;

  // Carregar o exercício
  fetch(endpoint)
    .then(res => {
      if (!res.ok) throw new Error('Erro ao carregar o exercício.');
      return res.json();
    })
    .then(exercicio => {
      // Preenche o título e o enunciado
      document.getElementById('titulo').textContent = exercicio.titulo;
      document.getElementById('enunciado').textContent = exercicio.enunciado;

      // Cria os botões das alternativas
      for (let i = 1; i <= 4; i++) {
        const btn = document.createElement('button');
        btn.textContent = exercicio[`alternativa_${i}`];
        btn.classList.add('alternativa');
        btn.dataset.indice = i;

        // Adiciona evento de clique para selecionar alternativa
        btn.addEventListener('click', () => {
          document.querySelectorAll('.alternativa').forEach(b => b.classList.remove('selecionada'));
          btn.classList.add('selecionada');
          alternativaSelecionada = parseInt(btn.dataset.indice);
        });

        alternativasDiv.appendChild(btn);
      }

      // Ação ao clicar em verificar resposta
      document.getElementById('verificar').addEventListener('click', () => {
        const resultado = document.getElementById('resultado');
        if (alternativaSelecionada === null) {
          resultado.textContent = "Selecione uma alternativa.";
          resultado.style.color = "orange";
        } else if (alternativaSelecionada === exercicio.resposta_correta) {
          resultado.textContent = "Resposta correta! 🎉";
          resultado.style.color = "green";
        } else {
          resultado.textContent = "Resposta incorreta. 😞";
          resultado.style.color = "red";
        }
      });

      // Aqui pode adicionar a lógica de exibição de um pictograma, caso necessário
      // Exemplo: document.getElementById('pictograma').src = exercicio.pictograma_url;

    })
    .catch(error => {
      document.getElementById('titulo').textContent = "Erro ao carregar exercício.";
      console.error(error);
    });
});

// Função para obter o código do exercício pela URL (?codigo=123 ou ?id=123 ou ?posicao=1)
function obterCodigoDaURL() {
const params = new URLSearchParams(window.location.search);
// Tenta pegar 'codigo', se não encontrar tenta 'id' ou 'posicao'
return params.get('codigo') || params.get('id') || params.get('posicao') || '1'; // Fallback para '1' se nada for encontrado
}
