document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const codigo = urlParams.get('codigo');

  if (!codigo) {
    console.error('Código do exercício não informado na URL');
    return;
  }

  try {
    // Busca o exercício atual
    const response = await fetch(`http://localhost:3000/api/exercicios/codigo/${codigo}`);
    if (!response.ok) {
      const erro = await response.json();
      console.error('Erro ao buscar exercício:', erro.message);
      return;
    }
    const exercicio = await response.json();

    // Preenche os elementos da página
    document.getElementById('titulo').textContent = exercicio.titulo;
    document.getElementById('enunciado').textContent = exercicio.enunciado;
    document.getElementById('alt1').textContent = exercicio.alternativa_1;
    document.getElementById('alt2').textContent = exercicio.alternativa_2;
    document.getElementById('alt3').textContent = exercicio.alternativa_3;
    document.getElementById('alt4').textContent = exercicio.alternativa_4;

    // Verificação da resposta
    document.getElementById('verificar').addEventListener('click', () => {
      const selecionada = document.querySelector('input[name="resposta"]:checked');
      const resultado = document.getElementById('resultado');

      if (!selecionada) {
        resultado.textContent = "Selecione uma resposta!";
        resultado.style.color = "orange";
        return;
      }

      const respostaEscolhida = Number(selecionada.value);
      if (respostaEscolhida === exercicio.resposta_correta) {
        resultado.textContent = "Correto!";
        resultado.style.color = "green";
      } else {
        resultado.textContent = "Incorreto. Tente novamente.";
        resultado.style.color = "red";
      }
    });

    // Buscar todos os exercícios para encontrar o próximo
    const todosResponse = await fetch('http://localhost:3000/exercicios');
    const todosExercicios = await todosResponse.json();

    // Ordena por posicao_trilha
    const ordenados = todosExercicios.sort((a, b) => a.posicao_trilha - b.posicao_trilha);

    // Encontra índice do exercício atual
    const indiceAtual = ordenados.findIndex(e => e.exercicio_codigo === codigo);

    if (indiceAtual !== -1 && indiceAtual < ordenados.length - 1) {
      const proximoExercicio = ordenados[indiceAtual + 1];
      const botaoProximo = document.getElementById('proximo');
      botaoProximo.style.display = 'inline-block';
      botaoProximo.addEventListener('click', () => {
        window.location.href = `exercicio.html?codigo=${proximoExercicio.exercicio_codigo}`;
      });
    }

  } catch (error) {
    console.error('Erro ao carregar o exercício:', error);
  }
});
