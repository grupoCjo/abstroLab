/*---------------------------------------------------------------------------------*/
//Configurações/ Imports/ Conexão com DB
/*---------------------------------------------------------------------------------*/

const winston = require("winston");
const path = require("path");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { query, closeConnection } = require('./backEndRepository/dbConnection');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());


const mysql = require('mysql2');

// Configurações da conexão
const connection = mysql.createConnection({
    host: process.env.DB_HOST,            // Pega o host do banco de dados do arquivo .env
    user: process.env.DB_USER,            // Usuário do banco
    password: process.env.DB_PASSWORD,    // Senha do banco
    database: process.env.DB_DATABASE,    // Nome do banco de dados
  });

// Tentando conectar
connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.stack);
        return;
    }
    console.log('Conexão bem-sucedida ao banco de dados com ID:', connection.threadId);
});

// Exportar a conexão (opcional)
module.exports = connection;

/*---------------------------------------------------------------------------------*/
// Logger com Winston
/*---------------------------------------------------------------------------------*/
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
      new winston.transports.Console()
  ]
});

/*---------------------------------------------------------------------------------*/
// Middlewares
/*---------------------------------------------------------------------------------*/

app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Servidor está rodando!");
  logger.info("A rota '/' foi acessada.");
});

app.get("/error", (req, res) => {
  logger.error("Erro simulado!");
  res.status(500).send("Erro interno no servidor.");
});

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
  console.log(` Servidor rodando em http://localhost:${PORT}`);
});

app.get("/fechar", (req, res) => {
  logger.info("Encerrando o servidor...");
  res.send("O servidor está sendo encerrado...");
  
  // Aguarde o envio da resposta antes de finalizar
  setTimeout(() => {
      process.exit(0); // Encerra o processo com sucesso (código 0)
  }, 1000);
});
const gerarUsuarioID = async () => {
  try {
    const resultado = await query("SELECT MAX(usuario_ID) AS ultimoID FROM usuarios");
    const ultimoID = resultado[0].ultimoID;
    return !ultimoID ? "0001" : (parseInt(ultimoID) + 1).toString().padStart(4, "0");
  } catch (error) {
    console.error("Erro ao gerar ID do usuário:", error);
    throw error;
  }
};

// CRIAR USUÁRIO (com ID manual ou auto_increment)
app.post("/api/usuarios", async (req, res) => {
  const { usuario_nome, usuario_email, usuario_data_nascimento } = req.body;

  if (!usuario_nome || !usuario_email || !usuario_data_nascimento) {
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios!" });
  }

  try {
    //AUTO_INCREMENT:
    const sql = "INSERT INTO usuarios (usuario_nome, usuario_email, usuario_data_nascimento) VALUES (?, ?, ?)";
    const result = await query(sql, [usuario_nome, usuario_email, usuario_data_nascimento]);

    res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      usuario_ID: result.insertId || usuario_ID // depende da estratégia
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({ message: "Erro no servidor", error });
  }
});

// Buscar todos os users
app.get("/api/usuarios", async (req, res) => {
  try {
    const usuarios = await query("SELECT * FROM usuarios");
    res.json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// Buscar usuário ESPECÍFICO
app.get("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await query("SELECT * FROM usuarios WHERE usuario_ID = ?", [id]);

    if (resultado.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado!" });
    }

    res.json(resultado[0]);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// ATUALIZAR USUÁRIO
app.put("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { usuario_nome, usuario_email, usuario_data_nascimento } = req.body;

  try {
    const sql = `
      UPDATE usuarios 
      SET usuario_nome = ?, usuario_email = ?, usuario_data_nascimento = ?
      WHERE usuario_ID = ?`;

    const result = await query(sql, [usuario_nome, usuario_email, usuario_data_nascimento, id]);

    res.json({ message: "Usuário atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// DELETAR USUÁRIO
app.delete("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await query("DELETE FROM usuarios WHERE usuario_ID = ?", [id]);
    res.json({ message: "Usuário deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

/*---------------------------------------------------------------------------------*/
// Rota - Exercícios
/*---------------------------------------------------------------------------------*/
// Geração sequencial de IDs
const gerarExercicioID = async () => {
  try {
    const resultado = await query("SELECT MAX(exercicio_ID) AS ultimoID FROM exercicios");
    const ultimoID = resultado[0].ultimoID;

    if (!ultimoID) return "0001";

    const numero = parseInt(ultimoID) + 1;
    return numero.toString().padStart(4, "0");
  } catch (error) {
    console.error("Erro ao gerar ID do exercício:", error);
    throw error;
  }
};

// Criar exercício único
app.post('/api/exercicios', async (req, res) => {
  const exercicio = req.body;

  if (!exercicio.posicao_trilha || !exercicio.titulo || !exercicio.enunciado ||
      !exercicio.alternativas || !exercicio.resposta_correta || !exercicio.nivel) {
    return res.status(400).json({
      error: 'Todos os campos são necessários (posicao_trilha, titulo, enunciado, alternativas, resposta_correta, nivel)'
    });
  }

  try {
    const novoID = await gerarExercicioID();

    const querySQL = `
      INSERT INTO exercicios (exercicio_ID, posicao_trilha, titulo, enunciado, alternativas, resposta_correta, nivel)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await query(querySQL, [
      novoID,
      exercicio.posicao_trilha,
      exercicio.titulo,
      exercicio.enunciado,
      JSON.stringify(exercicio.alternativas),
      exercicio.resposta_correta,
      exercicio.nivel
    ]);

    res.status(201).json({ message: 'Exercício criado com sucesso!', exercicio_ID: novoID });
  } catch (error) {
    console.error("Erro ao criar exercício:", error);
    res.status(500).json({ error: 'Erro ao inserir exercício', details: error });
  }
});

// Criar exercícios em lote
app.post('/api/exercicios/lote', async (req, res) => {
  const exercicios = req.body;

  if (!Array.isArray(exercicios) || exercicios.length === 0) {
    return res.status(400).json({ error: 'Envie uma lista de exercícios!' });
  }

  try {
    for (const exercicio of exercicios) {
      if (!exercicio.posicao_trilha || !exercicio.titulo || !exercicio.enunciado ||
          !exercicio.alternativas || !exercicio.resposta_correta || !exercicio.nivel) {
        return res.status(400).json({ error: 'Todos os campos são necessários em cada exercício' });
      }

      const novoID = await gerarExercicioID();

      const querySQL = `
        INSERT INTO exercicios (exercicio_ID, posicao_trilha, titulo, enunciado, alternativas, resposta_correta, nivel)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await query(querySQL, [
        novoID,
        exercicio.posicao_trilha,
        exercicio.titulo,
        exercicio.enunciado,
        JSON.stringify(exercicio.alternativas),
        exercicio.resposta_correta,
        exercicio.nivel
      ]);
    }

    res.status(201).json({ message: 'Exercícios criados com sucesso!' });
  } catch (error) {
    console.error("Erro ao inserir exercícios:", error);
    res.status(500).json({ error: 'Erro ao inserir exercícios', details: error });
  }
});

// Buscar todos os exercícios
app.get('/exercicios', async (req, res) => {
  try {
    const resultados = await query('SELECT * FROM exercicios ORDER BY posicao_trilha ASC');
    if (resultados.length > 0) {
      res.json(resultados);
    } else {
      res.status(404).json({ message: "Nenhum exercício encontrado." });
    }
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// Buscar exercício específico por ID
app.get('/api/exercicios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    console.log("ID recebido:", id);
    const resultado = await query('SELECT * FROM exercicios WHERE exercicio_ID = ?', [id]);
  
    if (resultado.length === 0) {
      return res.status(404).json({ message: 'Exercício não encontrado' });
    }
  
    const exercicio = resultado[0];
    console.log("Exercício encontrado:", exercicio);
  
    let alternativas;
    try {
      console.log("Alternativas brutas:", exercicio.alternativas);
      alternativas = JSON.parse(exercicio.alternativas);
    } catch (e) {
      console.error("Erro ao fazer parse de alternativas:", e.message);
      return res.status(500).json({ message: 'Formato de alternativas inválido' });
    }
  
    if (
      alternativas["1"] == null ||
      alternativas["2"] == null ||
      alternativas["3"] == null ||
      alternativas["4"] == null
    ) {
      console.error("Alternativas incompletas:", alternativas);
      return res.status(500).json({ message: 'Alternativas incompletas ou inválidas' });
    }
  
    const resposta_correta = Object.keys(alternativas).find(
      key => String(alternativas[key]) === String(exercicio.resposta_correta)
    );
  
    if (!resposta_correta) {
      console.error("Resposta correta não encontrada:", exercicio.resposta_correta, alternativas);
      return res.status(500).json({ message: 'Resposta correta não encontrada nas alternativas' });
    }
  
    return res.json({
      titulo: exercicio.titulo,
      enunciado: exercicio.enunciado,
      alternativa_1: alternativas["1"],
      alternativa_2: alternativas["2"],
      alternativa_3: alternativas["3"],
      alternativa_4: alternativas["4"],
      resposta_correta: Number(resposta_correta),
      nivel: exercicio.nivel,
      posicao_trilha: exercicio.posicao_trilha
    });
  } catch (error) {
    console.error("Erro ao buscar exercício:", error, error.stack);
    res.status(500).json({ message: 'Erro ao buscar exercício' });
  }
  
});

/*---------------------------------------------------------------------------------*/
// Rota - Sessões
/*---------------------------------------------------------------------------------*/
// POST /api/sessoes/criar
app.post('/api/sessoes/criar', async (req, res) => {
  try {
    const { usuario_ID, sessao_data_hora_inicio, sessao_data_hora_fim, sessao_duracao, sessao_status } = req.body;

    const sql = `
      INSERT INTO sessoes 
      (usuario_ID, sessao_data_hora_inicio, sessao_data_hora_fim, sessao_duracao, sessao_status) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await db.query(sql, [usuario_ID, sessao_data_hora_inicio, sessao_data_hora_fim, sessao_duracao, sessao_status]);

    res.status(201).json({ message: 'Sessão criada com sucesso', sessao_ID: result.insertId });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ error: 'Erro ao criar sessão' });
  }
});

//Req/Post - Criar uma nova sessão
app.post("/sessoes", (req, res) => {
    const { sessao_ID, usuario_ID, sessao_data_hora_inicio, sessao_data_hora_fim, sessao_duracao, sessao_status } = 
    req.body;
  
    db.query(
      "INSERT INTO sessoes (sessao_ID, usuario_ID, sessao_data_hora_inicio, sessao_data_hora_fim, sessao_duracao, sessao_status) VALUES (?, ?, ?, ?, ?, ?)",
      [sessao_ID, usuario_ID, sessao_data_hora_inicio, sessao_data_hora_fim, sessao_duracao, sessao_status],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Sessão criada com sucesso!" });
    });
});

/*---------------------------------------------------------------------------------*/
// Rota - Progresso/Registro
/*---------------------------------------------------------------------------------*/
// POST /api/progresso/registrar
app.post('/api/progresso/registrar', async (req, res) => {
  try {
    const { usuario_ID, exercicio_ID } = req.body;

    const sql = `
      INSERT INTO progresso_exercicios (usuario_ID, exercicio_ID) 
      VALUES (?, ?)
    `;

    await db.query(sql, [usuario_ID, exercicio_ID]);

    res.status(201).json({ message: 'Progresso registrado com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar progresso:', error);
    res.status(500).json({ error: 'Erro ao registrar progresso' });
  }
});


// Rota para verificar o progresso de um exercício
app.get('/api/progresso/:usuario_ID/:exercicio_ID', (req, res) => {
  const { usuario_ID, exercicio_ID } = req.params;

  db.query('SELECT * FROM progresso_exercicios WHERE usuario_ID = ? AND exercicio_ID = ?', 
      [usuario_ID, exercicio_ID], (err, results) => {
          if (err) {
              return res.status(500).json({ error: 'Erro ao verificar progresso' });
          }
          if (results.length > 0) {
              res.json(results[0]); // Retorna o progresso (ex: 1 ou 0)
          } else {
              res.json({ progresso: 0 }); // Se não tiver progresso, retorna 0
          }
      }
  );
});

//Req/Post - Registrar progresso de um exercício
app.post("/progresso", (req, res) => {
  const { usuario_ID, exercicio_ID } = req.body;

  db.query(
    "INSERT INTO progresso_exercicios (usuario_ID, exercicio_ID) VALUES (?, ?)",
    [usuario_ID, exercicio_ID],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Progresso registrado com sucesso!" });
  });
});
/*---------------------------------------------------------------------------------*/
// Rota - Configurações de User
/*---------------------------------------------------------------------------------*/  
//Req/Get - Checar configurações de um usuário
app.get("/configuracoes/:id", (req, res) => {
    const { id } = req.params;
  
    db.query("SELECT * FROM configuracoes_usuario WHERE usuario_ID = ?", [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
  
      if (results.length === 0) {
        return res.status(404).json({ message: "Configurações não encontradas!" });
      }
  
      res.json(results[0]);
    });
});
  
  
//Req/Put Atualizar configurações de usuário
app.put("/configuracoes/:id", (req, res) => {
    const { id } = req.params;
    const { tema } = req.body;
  
    db.query(
      "UPDATE configuracoes_usuario SET tema = ? WHERE usuario_ID = ?",
      [tema, id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Configurações atualizadas com sucesso!" });
    });
});
  
//Req/Get - Checar Progresso do usuário
app.get("/progresso/:id", (req, res) => {
    const { id } = req.params;
  
    db.query(
      "SELECT exercicios.titulo, exercicios.nivel FROM progresso_exercicios JOIN exercicios ON progresso_exercicios.exercicio_ID = exercicios.exercicio_ID WHERE progresso_exercicios.usuario_ID = ?",
      [id],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
  
        if (results.length === 0) {
          return res.status(404).json({ message: "Nenhum progresso encontrado!" });
        }
        res.json(results);
    });
});
  
/*---------------------------------------------------------------------------------*/
// Rotas páginas
/*---------------------------------------------------------------------------------*/
// Serve arquivos estáticos (CSS, JS, imagens, etc.)
app.use(express.static(path.join(__dirname, 'frontEndRepository/views')));

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoints para as seções da nav bar
app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'cadastro.html'));
});

app.get('/trilha', (req, res) => {
  res.sendFile(path.join(__dirname, 'trilha.html'));
});
