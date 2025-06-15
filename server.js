const winston = require("winston");
const path = require("path");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { query, closeConnection } = require("./backEndRepository/dbConnection");
const PORT = process.env.PORT || 3000;
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Winston Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: "logs/app.log" }),
    new winston.transports.Console(),
  ],
});

// Middleware para logar apenas requisições não estáticas
app.use((req, res, next) => {
  const staticFileExtensions = [".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".mp3", ".html"]; // Adicionado .html
  const isStaticFile = staticFileExtensions.some(ext => req.url.endsWith(ext));

  if (!isStaticFile) {
    logger.info(`Request: ${req.method} ${req.url}`);
  }
  next();
});

// Servir arquivos estáticos
app.use("/css", express.static(path.join(__dirname, "frontEndRepository/css")));
app.use("/js", express.static(path.join(__dirname, "frontEndRepository/js")));
app.use("/img", express.static(path.join(__dirname, "frontEndRepository/img")));
// **NOVA LINHA:** Servir a pasta 'views' para que header.html e footer.html sejam acessíveis
app.use("/views", express.static(path.join(__dirname, "frontEndRepository/views")));
app.use("/audio", express.static(path.join(__dirname, "frontEndRepository/audio")));


// Rotas para servir as páginas HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontEndRepository", "views", "index.html"));
  logger.info("A rota '/' foi acessada.");
});

// As demais rotas de HTML podem ser simplificadas se você quiser que elas funcionem sem o prefixo /views/
// Por exemplo, acessar /cadastro diretamente em vez de /views/cadastro.html
app.get("/cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "frontEndRepository", "views", "cadastro.html"));
});

app.get("/trilha", (req, res) => {
  res.sendFile(path.join(__dirname, "frontEndRepository", "views", "trilha.html"));
});

app.get("/exercicio", (req, res) => {
  res.sendFile(path.join(__dirname, "frontEndRepository", "views", "exercicio.html"));
});

app.get("/configuracoes", (req, res) => {
  res.sendFile(path.join(__dirname, "frontEndRepository", "views", "configuracoes.html"));
});

app.get("/paginaInicial", (req, res) => {
  res.sendFile(path.join(__dirname, "frontEndRepository", "views", "paginaInicial.html"));
});

app.get("/sobre", (req, res) => {
  res.sendFile(path.join(__dirname, "frontEndRepository", "views", "sobre.html"));
});

app.get("/contato", (req, res) => {
  res.sendFile(path.join(__dirname, "frontEndRepository", "views", "contato.html"));
});

// Rota de erro simulada
app.get("/error", (req, res) => {
  logger.error("Erro simulado!");
  res.status(500).send("Erro interno no servidor.");
});

// Iniciar o servidor
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Rota para encerrar o servidor (apenas para desenvolvimento/testes)
app.get("/fechar", (req, res) => {
  logger.info("Encerrando o servidor...");
  res.send("O servidor está sendo encerrado...");
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// Rotas da API de Usuários
app.post("/api/usuarios", async (req, res) => {
  const {
    usuario_nome,
    usuario_email,
    usuario_data_nascimento,
    usuario_senha,
    usuario_genero,
  } = req.body;

  if (
    !usuario_nome ||
    !usuario_email ||
    !usuario_data_nascimento ||
    !usuario_senha ||
    !usuario_genero
  ) {
    logger.warn("Tentativa de cadastro com campos obrigatórios ausentes.");
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios!" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(usuario_email)) {
    logger.warn(`Tentativa de cadastro com e-mail inválido: ${usuario_email}`);
    return res.status(400).json({ message: "E-mail inválido!" });
  }

  try {
    const hashedSenha = await bcrypt.hash(usuario_senha, saltRounds);

    const sql = `
      INSERT INTO usuarios (usuario_nome, usuario_email, usuario_data_nascimento, usuario_senha, usuario_genero)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      usuario_nome,
      usuario_email,
      usuario_data_nascimento,
      hashedSenha,
      usuario_genero,
    ]);

    logger.info(`Novo usuário cadastrado com ID: ${result.insertId}`);
    res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      usuario_ID: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      logger.warn(`Tentativa de cadastro com e-mail já existente: ${usuario_email}`);
      return res.status(409).json({ message: "E-mail já cadastrado." });
    }
    logger.error(`Erro ao cadastrar usuário: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  }
});

app.get("/api/usuarios", async (req, res) => {
  try {
    const usuarios = await query("SELECT * FROM usuarios");
    logger.info("Lista de usuários solicitada.");
    res.json(usuarios);
  } catch (error) {
    logger.error(`Erro ao buscar usuários: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: "Erro no servidor" });
  }
});

app.get("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await query(
      "SELECT usuario_ID, usuario_nome, usuario_email, usuario_data_nascimento, usuario_genero FROM usuarios WHERE usuario_ID = ?",
      [id]
    );

    if (resultado.length === 0) {
      logger.warn(`Usuário com ID ${id} não encontrado.`);
      return res.status(404).json({ message: "Usuário não encontrado!" });
    }
    logger.info(`Dados do usuário com ID ${id} solicitados.`);
    res.json(resultado[0]);
  } catch (error) {
    logger.error(`Erro ao buscar usuário com ID ${id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: "Erro no servidor" });
  }
});

app.put("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { usuario_nome, usuario_email, usuario_data_nascimento, usuario_senha, usuario_genero } = req.body;

  const fieldsToUpdate = {};
  if (usuario_nome) fieldsToUpdate.usuario_nome = usuario_nome;
  if (usuario_email) fieldsToUpdate.usuario_email = usuario_email;
  if (usuario_data_nascimento) fieldsToUpdate.usuario_data_nascimento = usuario_data_nascimento;
  if (usuario_genero) fieldsToUpdate.usuario_genero = usuario_genero;
  if (usuario_senha) fieldsToUpdate.usuario_senha = await bcrypt.hash(usuario_senha, saltRounds);

  if (Object.keys(fieldsToUpdate).length === 0) {
    logger.warn(`Tentativa de atualização de usuário com ID ${id} sem dados fornecidos.`);
    return res.status(400).json({ message: "Nenhum dado para atualizar foi fornecido." });
  }

  try {
    const sql = `UPDATE usuarios SET ? WHERE usuario_ID = ?`;
    const result = await query(sql, [fieldsToUpdate, id]);

    if (result.affectedRows === 0) {
      logger.warn(`Usuário com ID ${id} não encontrado para atualização.`);
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    logger.info(`Usuário com ID ${id} atualizado com sucesso.`);
    res.json({ message: "Usuário atualizado com sucesso!" });
  } catch (error) {
    logger.error(`Erro ao atualizar usuário com ID ${id}: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

app.delete("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query("DELETE FROM usuarios WHERE usuario_ID = ?", [id]);
    if (result.affectedRows === 0) {
      logger.warn(`Tentativa de deletar usuário com ID ${id} que não existe.`);
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    logger.info(`Usuário com ID ${id} deletado com sucesso.`);
    res.json({ message: "Usuário deletado com sucesso!" });
  } catch (error) {
    logger.error(`Erro ao deletar usuário com ID ${id}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// Rotas da API de Exercícios
app.post("/api/exercicios", async (req, res) => {
  let exercicios = req.body;

  if (!Array.isArray(exercicios)) {
    exercicios = [exercicios];
  }

  for (const exercicio of exercicios) {
    const camposObrigatorios = [
      "posicao_trilha",
      "titulo",
      "enunciado",
      "alternativas",
      "resposta_correta",
      "nivel",
    ];

    for (const campo of camposObrigatorios) {
      if (!exercicio[campo]) {
        logger.warn(`Tentativa de criar exercício com campo obrigatório ausente: ${campo}`);
        return res.status(400).json({
          error: `Campo obrigatório ausente: ${campo}`,
        });
      }
    }
    // Validação de alternativas: Deve ser um objeto com chaves '1', '2', '3', '4'
    if (typeof exercicio.alternativas !== 'object' || Object.keys(exercicio.alternativas).length !== 4 || !['1', '2', '3', '4'].every(key => exercicio.alternativas.hasOwnProperty(key))) {
        logger.warn(`Tentativa de criar exercício com formato de alternativas inválido: ${JSON.stringify(exercicio.alternativas)}`);
        return res.status(400).json({ error: "Formato de alternativas inválido. Deve ser um objeto com chaves '1', '2', '3', '4'." });
    }
    // Validação da resposta_correta: Deve ser um dos valores das alternativas
    if (!Object.values(exercicio.alternativas).some(val => String(val) === String(exercicio.resposta_correta))) {
        logger.warn(`Tentativa de criar exercício onde resposta_correta não corresponde a nenhuma alternativa: ${exercicio.resposta_correta}`);
        return res.status(400).json({ error: "A resposta_correta deve corresponder a uma das alternativas." });
    }
  }

  try {
    const resultados = [];

    for (const exercicio of exercicios) {
      // O exercicio_ID é AUTO_INCREMENT, e o trigger cuidará do exercicio_codigo
      const querySQL = `
        INSERT INTO exercicios (posicao_trilha, titulo, enunciado, alternativas, resposta_correta, nivel, codigo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await query(querySQL, [
        exercicio.posicao_trilha,
        exercicio.titulo,
        exercicio.enunciado,
        JSON.stringify(exercicio.alternativas),
        exercicio.resposta_correta,
        exercicio.nivel,
        exercicio.codigo // o campo 'codigo' do JSON de entrada será ignorado se o trigger for usado, mas o modelo de dados o inclui
      ]);
      logger.info(`Exercício cadastrado com ID: ${result.insertId} e Título: ${exercicio.titulo}`);
      resultados.push({ exercicio_ID: result.insertId, titulo: exercicio.titulo });
    }

    res
      .status(201)
      .json({
        message: "Exercício(s) criado(s) com sucesso!",
        criados: resultados,
      });
  } catch (error) {
    logger.error(`Erro ao criar exercício(s): ${error.message}`, { stack: error.stack });
    res
      .status(500)
      .json({ error: "Erro ao inserir exercício(s)", details: error.message });
  }
});

app.get("/exercicios", async (req, res) => {
  try {
    const resultados = await query(
      "SELECT * FROM exercicios ORDER BY posicao_trilha ASC"
    );
    if (resultados.length > 0) {
      logger.info("Lista de exercícios solicitada.");
      res.json(resultados);
    } else {
      logger.info("Nenhum exercício encontrado.");
      // Alterado para 200 com array vazio para consistência no front-end
      res.status(200).json([]);
    }
  } catch (error) {
    logger.error(`Erro ao buscar exercícios: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

app.get("/api/exercicios/codigo/:codigo", async (req, res) => {
  const { codigo } = req.params;

  try {
    const [exercicio] = await query(
      "SELECT exercicio_ID, exercicio_codigo, titulo, enunciado, alternativas, resposta_correta, nivel, posicao_trilha FROM exercicios WHERE exercicio_codigo = ?",
      [codigo]
    );

    if (!exercicio) {
      logger.warn(`Exercício com código ${codigo} não encontrado.`);
      return res.status(404).json({ message: "Exercício não encontrado" });
    }

    let alternativas;
    try {
      alternativas = JSON.parse(exercicio.alternativas);
    } catch (e) {
      logger.error(`Erro ao fazer parse de alternativas para exercício ${codigo}: ${e.message}`);
      return res.status(500).json({ message: "Formato de alternativas inválido" });
    }

    // A resposta_correta pode ser um valor (e.g., "3") ou a chave da alternativa (e.g., "1")
    // Devemos encontrar o número da alternativa que corresponde à resposta_correta
    const respostaCorretaKey = Object.keys(alternativas).find(key => String(alternativas[key]) === String(exercicio.resposta_correta));

    if (!respostaCorretaKey) {
        logger.error(`Resposta correta '${exercicio.resposta_correta}' não encontrada nas alternativas para exercício ${codigo}.`);
        return res.status(500).json({ message: "Resposta correta não encontrada nas alternativas" });
    }

    logger.info(`Detalhes do exercício com código ${codigo} solicitados.`);
    return res.json({
      exercicio_ID: exercicio.exercicio_ID,
      exercicio_codigo: exercicio.exercicio_codigo,
      titulo: exercicio.titulo,
      enunciado: exercicio.enunciado,
      alternativas: alternativas, // Envia o objeto de alternativas diretamente
      resposta_correta: exercicio.resposta_correta, // A resposta correta como string/valor
      nivel: exercicio.nivel,
      posicao_trilha: exercicio.posicao_trilha,
    });
  } catch (error) {
    logger.error(`Erro ao buscar exercício com código ${codigo}: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: "Erro ao buscar exercício" });
  }
});

// Rotas da API de Sessões
app.post("/api/sessoes/criar", async (req, res) => {
  try {
    const { usuario_ID } = req.body;

    if (!usuario_ID) {
      logger.warn("Tentativa de criar sessão sem usuario_ID.");
      return res.status(400).json({ message: "ID do usuário é obrigatório." });
    }

    const sessao_data_hora_inicio = new Date();
    const sessao_data_hora_fim = null;
    const sessao_duracao = null;
    const sessao_status = "ativa";

    const sql = `
      INSERT INTO sessoes
      (usuario_ID, sessao_data_hora_inicio, sessao_data_hora_fim, sessao_duracao, sessao_status)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      usuario_ID,
      sessao_data_hora_inicio,
      sessao_data_hora_fim,
      sessao_duracao,
      sessao_status,
    ]);

    logger.info(`Sessão criada para o usuário ${usuario_ID} com ID: ${result.insertId}`);
    res.status(201).json({
      message: "Sessão criada com sucesso",
      sessao_ID: result.insertId,
    });
  } catch (error) {
    logger.error(`Erro ao criar sessão: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: "Erro ao criar sessão", details: error.message });
  }
});

app.get("/api/sessoes/usuario/:sessao_ID", async (req, res) => {
  const { sessao_ID } = req.params;
  try {
    const result = await query(
      "SELECT usuario_ID FROM sessoes WHERE sessao_ID = ? AND sessao_status = 'ativa'",
      [sessao_ID]
    );
    if (result.length > 0) {
      logger.info(`Usuário da sessão ${sessao_ID} solicitado.`);
      res.json({ usuario_ID: result[0].usuario_ID });
    } else {
      logger.warn(`Sessão ${sessao_ID} não encontrada ou inativa.`);
      res.status(404).json({ message: "Sessão não encontrada ou inativa." });
    }
  } catch (error) {
    logger.error(`Erro ao buscar usuário da sessão ${sessao_ID}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// Rotas da API de Progresso
app.post("/api/progresso/registrar", async (req, res) => {
  try {
    const { usuario_ID, exercicio_ID } = req.body;

    if (!usuario_ID || !exercicio_ID) {
      logger.warn("Tentativa de registrar progresso com campos obrigatórios ausentes.");
      return res.status(400).json({ message: "IDs de usuário e exercício são obrigatórios." });
    }

    const sql = `
      INSERT INTO progresso_exercicios (usuario_ID, exercicio_ID)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE exercicio_ID = exercicio_ID -- Faz nada se já existir, apenas para evitar erro
    `; // Adicionado ON DUPLICATE KEY UPDATE para evitar erros se o progresso já existir

    await query(sql, [usuario_ID, exercicio_ID]);
    logger.info(`Progresso registrado para o usuário ${usuario_ID} no exercício ${exercicio_ID}.`);
    res.status(201).json({ message: "Progresso registrado com sucesso" });
  } catch (error) {
    logger.error(`Erro ao registrar progresso para usuário ${req.body.usuario_ID}, exercício ${req.body.exercicio_ID}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: "Erro ao registrar progresso", details: error.message });
  }
});

app.get("/api/progresso/:usuario_ID/:exercicio_ID", async (req, res) => {
  const { usuario_ID, exercicio_ID } = req.params;
  try {
    const results = await query(
      "SELECT * FROM progresso_exercicios WHERE usuario_ID = ? AND exercicio_ID = ?",
      [usuario_ID, exercicio_ID]
    );
    if (results.length > 0) {
      logger.info(`Progresso do usuário ${usuario_ID} para o exercício ${exercicio_ID} solicitado.`);
      res.json(results[0]);
    } else {
      logger.info(`Nenhum progresso encontrado para o usuário ${usuario_ID} no exercício ${exercicio_ID}.`);
      res.json({ progresso: 0 }); // Retorna um objeto indicando que não há progresso se não for encontrado
    }
  } catch (error) {
    logger.error(`Erro ao verificar progresso para usuário ${usuario_ID}, exercício ${exercicio_ID}: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ error: "Erro ao verificar progresso", details: error.message });
  }
});

app.get("/progresso/:usuario_ID", async (req, res) => {
  const { usuario_ID } = req.params;
  try {
    const results = await query(
      "SELECT e.titulo, e.nivel, pe.exercicio_ID FROM progresso_exercicios pe JOIN exercicios e ON pe.exercicio_ID = e.exercicio_ID WHERE pe.usuario_ID = ?",
      [usuario_ID]
    );
    logger.info(`Progresso geral do usuário ${usuario_ID} solicitado.`);
    res.status(200).json(results);
  } catch (error) {
    logger.error(`Erro ao buscar progresso do usuário ${usuario_ID}: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: "Erro interno do servidor.", details: error.message });
  }
});

app.get("/api/progresso/proximo/:usuario_ID", async (req, res) => {
  const { usuario_ID } = req.params;
  try {
    const progressoSql = `
            SELECT MAX(e.posicao_trilha) as ultimaPosicao
            FROM progresso_exercicios pe
            JOIN exercicios e ON pe.exercicio_ID = e.exercicio_ID
            WHERE pe.usuario_ID = ?
        `;
    const progressoResult = await query(progressoSql, [usuario_ID]);
    const ultimaPosicao = progressoResult[0].ultimaPosicao || 0;

    const proximoExercicioSql = `
            SELECT exercicio_ID, exercicio_codigo, titulo, enunciado, posicao_trilha FROM exercicios
            WHERE posicao_trilha > ?
            ORDER BY posicao_trilha ASC
            LIMIT 1
        `;
    const proximoExercicioResult = await query(proximoExercicioSql, [
      ultimaPosicao,
    ]);

    if (proximoExercicioResult.length > 0) {
      const proximoExercicio = proximoExercicioResult[0];
      logger.info(`Próximo exercício para o usuário ${usuario_ID} é ${proximoExercicio.exercicio_codigo}.`);
      res.json({
        exercicio_ID: proximoExercicio.exercicio_ID,
        exercicio_codigo: proximoExercicio.exercicio_codigo,
        titulo: proximoExercicio.titulo,
        descricao: proximoExercicio.enunciado,
        posicao_trilha: proximoExercicio.posicao_trilha,
        trilhaConcluida: false,
      });
    } else {
      const totalExerciciosResult = await query(
        "SELECT COUNT(*) AS total FROM exercicios"
      );
      const totalExercicios = totalExerciciosResult[0].total;

      if (ultimaPosicao >= totalExercicios && totalExercicios > 0) {
        logger.info(`Trilha concluída para o usuário ${usuario_ID}.`);
        return res.json({ message: "Trilha concluída! Parabéns!", trilhaConcluida: true });
      }
      logger.info(`Nenhum próximo exercício encontrado para o usuário ${usuario_ID}.`);
      res.json({ message: "Nenhum próximo exercício encontrado.", trilhaConcluida: false });
    }
  } catch (error) {
    logger.error(
      `Erro ao buscar próximo exercício para o usuário ${usuario_ID}: ${error.message}`,
      { stack: error.stack }
    );
    res.status(500).json({ message: "Erro ao calcular próximo exercício.", details: error.message });
  }
});

// Rotas da API de Login
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuarios = await query(
      "SELECT usuario_ID, usuario_senha FROM usuarios WHERE usuario_email = ?",
      [email]
    );

    if (!usuarios || usuarios.length === 0) {
      logger.warn(`Tentativa de login com e-mail não encontrado: ${email}`);
      return res.status(401).json({ message: "E-mail ou senha inválidos." });
    }

    const usuario = usuarios[0];
    const passwordIsValid = await bcrypt.compare(senha, usuario.usuario_senha);

    if (!passwordIsValid) {
      logger.warn(`Tentativa de login com senha inválida para e-mail: ${email}`);
      return res.status(401).json({ message: "E-mail ou senha inválidos" });
    }
    logger.info(`Login bem-sucedido para o usuário com ID: ${usuario.usuario_ID}`);
    res.status(200).json({
      message: "Login realizado com sucesso!",
      usuario_ID: usuario.usuario_ID,
    });
  } catch (error) {
    logger.error(`Erro no login para e-mail ${email}: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// Rotas da API de Configurações do Usuário
app.get("/api/configuracoes/:usuario_ID", async (req, res) => {
  const { usuario_ID } = req.params;
  try {
    const results = await query(
      "SELECT tema FROM configuracoes_usuario WHERE usuario_ID = ?",
      [usuario_ID]
    );

    if (results.length === 0) {
      logger.info(`Configurações não encontradas para o usuário ${usuario_ID}.`);
      return res.status(404).json({ message: "Configurações não encontradas!" });
    }
    logger.info(`Configurações para o usuário ${usuario_ID} solicitadas.`);
    res.json(results[0]);
  } catch (error) {
    logger.error(`Erro ao buscar configurações do usuário ${usuario_ID}: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/configuracoes/:usuario_ID", async (req, res) => {
  const { usuario_ID } = req.params;
  const { tema } = req.body;

  if (!tema) {
    logger.warn(`Tentativa de atualizar configurações do usuário ${usuario_ID} sem tema.`);
    return res.status(400).json({ message: "O tema é obrigatório." });
  }

  try {
    const sql = `
            INSERT INTO configuracoes_usuario (usuario_ID, tema)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE tema = ?
        `;
    await query(sql, [usuario_ID, tema, tema]);
    logger.info(`Tema '${tema}' salvo para o usuário ${usuario_ID}.`);
    res.json({ message: "Tema salvo com sucesso!" });
  } catch (error) {
    logger.error(`Erro ao salvar tema para o usuário ${usuario_ID}: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ message: "Erro ao salvar configurações.", details: error.message });
  }
});

const axios = require("axios");

app.get("/api/pictogramas/:busca", async (req, res) => {
  const { busca } = req.params;
  try {
    const url = `https://api.arasaac.org/api/pictograms/pt/search/${encodeURIComponent(
      busca
    )}`;
    const response = await axios.get(url);

    res.json(response.data);
  } catch (error) {
    logger.error(`Erro ao buscar pictograma para "${busca}": ${error.message}`, {
      stack: error.stack,
    });
    if (error.response && error.response.status === 404) {
      return res.json([]);
    }
    res.status(500).json({ message: "Erro ao buscar pictograma." });
  }
});