document.addEventListener('DOMContentLoaded', () => {
    const codigo = obterCodigoDaURL();
    const endpoint = `http://localhost:3000/exercicios/${codigo}`;
    const alternativasDiv = document.getElementById('alternativas');
    let alternativaSelecionada = null;
  
    fetch(endpoint)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar o exercício.');
        return res.json();
      })
      .then(exercicio => {
        document.getElementById('titulo').textContent = exercicio.titulo;
        document.getElementById('enunciado').textContent = exercicio.enunciado;
  
        for (let i = 1; i <= 4; i++) {
          const btn = document.createElement('button');
          btn.textContent = exercicio[`alternativa_${i}`];
          btn.classList.add('alternativa');
          btn.dataset.indice = i;
  
          btn.addEventListener('click', () => {
            document.querySelectorAll('.alternativa').forEach(b => b.classList.remove('selecionada'));
            btn.classList.add('selecionada');
            alternativaSelecionada = parseInt(btn.dataset.indice);
          });
  
          alternativasDiv.appendChild(btn);
        }
  
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
  
        // Inserir a chamada do pictograma aqui.
        
  
      })
      .catch(error => {
        document.getElementById('titulo').textContent = "Erro ao carregar exercício.";
        console.error(error);
      });
  });
  
  // Função auxiliar para obter o código do exercício pela URL (?codigo=123)
  function obterCodigoDaURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('codigo') || '1'; // fallback para '1' se não houver código
  }
  