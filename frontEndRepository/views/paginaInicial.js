export function carregarPaginaInicial() {
const html = `
<div class="container">
  <div class="sidebar">
    <div class="user-info">
      <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt="Usuário" />
      <span>Jogador: <strong id="nomeUsuario">Teste</strong></span>
    </div>
    <div class="score-info">
      <img src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" alt="Score" />
      <span>Pontuação: <strong id="pontuacao">0</strong></span>
    </div>
    <div class="phase-info">
      <img src="https://cdn-icons-png.flaticon.com/512/1828/1828802.png" alt="Phase" />
      <span>Fase Atual: <strong id="fase">15</strong></span>
    </div>
  </div>

  <div class="top-info" id="topInfo">
    <h1 class="titulo-jogo">Bem-Vindo ao AbstroLab!</h1>
    <div class="botoes-jogo">
      <button class="botao-acao" onclick="iniciarJogo()">Jogar</button>
      <button class="botao-acao" onclick="carregarTrilha()">Ver Trilha</button>
    </div>
  </div>

  <div class="game-board" id="gameBoard">
    <div class="trilha-linear casas-wrapper" id="trilhaCasas">
      <!-- Casas são geradas pelo JS -->
    </div>
  </div>
</div>

<footer class="footer">
  <div class="progresso-container">
    <span class="texto-progresso">Seu progresso:</span>
    <div class="barra-externa">
      <div class="barra-interna" id="barraProgresso"></div>
      <div class="avatar" id="avatar"></div>
    </div>
  </div>
</footer>
`;

document.body.innerHTML = html;

async function carregarTrilha() {
  try {
    const response = await fetch('trilha.html');
    if (!response.ok) {
      throw new Error('Erro ao carregar trilha.html');
    }
    const conteudo = await response.text();
    document.getElementById('gameBoard').innerHTML = conteudo;
  } catch (error) {
    console.error('Erro ao carregar a trilha:', error);
  }
}

}

