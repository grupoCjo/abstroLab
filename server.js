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
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
app.use(cors());
app.use(express.json());

/*-----------------------------------------------------------------------------------------------------*/
/*Sem essas rotas de middleware e p html a automação da página de exercícios não funciona! 
Ninguém mexe aqui por favor!
-Bea */

// Middleware para servir arquivos estáticos
app.use('/css', express.static(path.join(__dirname, 'frontEndRepository/css')));
app.use('/js', express.static(path.join(__dirname, 'frontEndRepository/js')));

// Rota para servir páginas HTM
app.get('/exercicio.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontEndRepository/views/exercicio.html'));
});
/*-----------------------------------------------------------------------------------------------------*/

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
  const { usuario_nome, usuario_email, usuario_data_nascimento, usuario_senha } = req.body;

  if (!usuario_nome || !usuario_email || !usuario_data_nascimento || !usuario_senha) {
    return res.status(400).json({ message: "Preencha todos os campos obrigatórios!" });
  }

  // Validação simples de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(usuario_email)) {
    return res.status(400).json({ message: "E-mail inválido!" });
  }

  try {
    const hashedSenha = await bcrypt.hash(usuario_senha, saltRounds);

    const sql = `
      INSERT INTO usuarios (usuario_nome, usuario_email, usuario_data_nascimento, usuario_senha)
      VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [
      usuario_nome,
      usuario_email,
      usuario_data_nascimento,
      hashedSenha
    ]);

    res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      usuario_ID: result.insertId
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

// Combinação das rotas para aceitar 1 ou N exercícios
app.post('/api/exercicios', async (req, res) => {
  let exercicios = req.body;

  // Se for um único exercício, transforma em array
  if (!Array.isArray(exercicios)) {
    exercicios = [exercicios];
  }

  // Validação geral
  for (const exercicio of exercicios) {
    const camposObrigatorios = ['posicao_trilha', 'titulo', 'enunciado', 'alternativas', 'resposta_correta', 'nivel'];

    for (const campo of camposObrigatorios) {
      if (!exercicio[campo]) {
        return res.status(400).json({
          error: `Campo obrigatório ausente: ${campo}`
        });
      }
    }
  }

  try {
    const resultados = [];

    for (const exercicio of exercicios) {
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

      resultados.push({ exercicio_ID: novoID, titulo: exercicio.titulo });
    }

    res.status(201).json({ message: 'Exercício(s) criado(s) com sucesso!', criados: resultados });
  } catch (error) {
    console.error("Erro ao criar exercício(s):", error);
    res.status(500).json({ error: 'Erro ao inserir exercício(s)', details: error });
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

app.get('/api/exercicios/codigo/:codigo', async (req, res) => {
  const { codigo } = req.params;

  try {
    console.log("Código recebido:", codigo);
    const [exercicio] = await query('SELECT * FROM exercicios WHERE exercicio_codigo = ?', [codigo]);

    if (!exercicio) {
      return res.status(404).json({ message: 'Exercício não encontrado' });
    }

    let alternativas;
    try {
      alternativas = JSON.parse(exercicio.alternativas);
    } catch (e) {
      console.error("Erro ao fazer parse de alternativas:", e.message);
      return res.status(500).json({ message: 'Formato de alternativas inválido' });
    }

    const opcoesValidas = ["1", "2", "3", "4"].every(key => alternativas[key] != null);
    if (!opcoesValidas) {
      return res.status(500).json({ message: 'Alternativas incompletas ou inválidas' });
    }

    const respostaCorreta = Object.entries(alternativas).find(
      ([_, valor]) => String(valor) === String(exercicio.resposta_correta)
    );

    if (!respostaCorreta) {
      return res.status(500).json({ message: 'Resposta correta não encontrada nas alternativas' });
    }

    return res.json({
      titulo: exercicio.titulo,
      enunciado: exercicio.enunciado,
      alternativa_1: alternativas["1"],
      alternativa_2: alternativas["2"],
      alternativa_3: alternativas["3"],
      alternativa_4: alternativas["4"],
      resposta_correta: Number(respostaCorreta[0]),
      nivel: exercicio.nivel,
      posicao_trilha: exercicio.posicao_trilha
    });

  } catch (error) {
    console.error("Erro ao buscar exercício:", error);
    return res.status(500).json({ message: 'Erro ao buscar exercício' });
  }
});


/*---------------------------------------------------------------------------------*/
// Rota - Sessões
/*---------------------------------------------------------------------------------*/
// POST /api/sessoes/criar
app.post('/api/sessoes/criar', async (req, res) => {
  try {
    const { usuario_ID } = req.body;

    const sessao_data_hora_inicio = new Date(); // Agora
    const sessao_data_hora_fim = null;
    const sessao_duracao = null;
    const sessao_status = 'ativa';

    const sql = `
      INSERT INTO sessoes 
      (usuario_ID, sessao_data_hora_inicio, sessao_data_hora_fim, sessao_duracao, sessao_status) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await db.query(sql, [
      usuario_ID,
      sessao_data_hora_inicio,
      sessao_data_hora_fim,
      sessao_duracao,
      sessao_status
    ]);

    res.status(201).json({
      message: 'Sessão criada com sucesso',
      sessao_ID: result.insertId
    });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ error: 'Erro ao criar sessão' });
  }
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
app.use(express.static(path.join(__dirname, 'frontEndRepository')));

/// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontEndRepository', 'views', 'index.html'));
});

// Endpoints da nav bar
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontEndRepository', 'views', 'index.html'));
});

app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontEndRepository', 'views', 'cadastro.html'));
});

app.get('/trilha', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontEndRepository', 'views', 'trilha.html'));
});

app.get('/exercicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontEndRepository', 'views', 'exercicio.html'));
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  console.log('Login:', email, senha); 

  try {
    const db = require("./backEndRepository/dbConnection")
    const [usuarios] = await db.query("SELECT email, FROM usuarios WHERE usuario_email = ?", [email]);
    console.log("USUARIOS:: " + JSON.stringify(usuarios));
    const usuario = usuarios[0];
    // console.log("USER EMAIL:: " + usuario.usuario_email);
  
    
    if (usuario.usuario_email !== email) {
      return res.status(401).json({ message: "Email inválido" });
    }

    if (usuario.usuario_senha !== senha) {
      return res.status(401).json({ message: "Senha inválida" });
    }

    res.status(200).json({
      message: "Login realizado com sucesso!",
      usuario_ID: usuario.usuario_ID
    });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

  
app.post("/cadastrar", (req, res) => {
  const { nome, email, senha, dataNascimento } = req.body;

  if (!nome || !email || !senha || !dataNascimento) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }

  const query = "INSERT INTO usuarios (usuario_nome, usuario_email, usuario_data_nascimento, senha) VALUES (?, ?, ?, ?)";

  db.query(query, [nome, email, dataNascimento, senha], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "E-mail já cadastrado." });
      }
      console.error("Erro ao cadastrar:", err);
      return res.status(500).json({ message: "Erro ao cadastrar usuário." });
    }

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  });
});

/*---------------------------------------------------------------------------------*/
// Rota da API - PICTOGRAMAS (ARASAAC)
/*---------------------------------------------------------------------------------*/
const axios = require('axios'); // Certifique-se de que o axios está importado no topo do arquivo

app.get('/api/pictogramas/:busca', async (req, res) => {
    const { busca } = req.params;
    try {
        const url = `https://api.arasaac.org/api/pictograms/pt/search/${encodeURIComponent(busca)}`;
        const response = await axios.get(url);

        res.json(response.data);

    } catch (error) {
        logger.error(`Erro ao buscar pictograma para "${busca}":`, { stack: error.stack });
        if (error.response && error.response.status === 404) {
            return res.json([]);
        }
        res.status(500).json({ message: 'Erro ao buscar pictograma.' });
    }
});

/*---------------------------------------------------------------------------------*/
// Rota da API - LÓGICA DE PROGRESSO
/*---------------------------------------------------------------------------------*/

// NOVO ENDPOINT: Retorna o próximo exercício que o usuário deve fazer
app.get('/api/progresso/proximo/:usuario_ID', async (req, res) => {
    const { usuario_ID } = req.params;
    try {
        // 1. Descobrir a última posição na trilha que o usuário completou
        const progressoSql = `
            SELECT MAX(e.posicao_trilha) as ultimaPosicao
            FROM progresso_exercicios pe
            JOIN exercicios e ON pe.exercicio_ID = e.exercicio_ID
            WHERE pe.usuario_ID = ?
        `;
        const progressoResult = await query(progressoSql, [usuario_ID]);
        const ultimaPosicao = progressoResult[0].ultimaPosicao || 0;

        // 2. Encontrar o exercício com a posição imediatamente seguinte
        const proximoExercicioSql = `
            SELECT * FROM exercicios 
            WHERE posicao_trilha > ? 
            ORDER BY posicao_trilha ASC 
            LIMIT 1
        `;
        const proximoExercicioResult = await query(proximoExercicioSql, [ultimaPosicao]);

        if (proximoExercicioResult.length > 0) {
            res.json(proximoExercicioResult[0]);
        } else {
            // Se não houver próximo, pode ser o primeiro exercício ou o final da trilha
            const primeiroExercicioSql = `SELECT * FROM exercicios ORDER BY posicao_trilha ASC LIMIT 1`;
            const primeiroExercicioResult = await query(primeiroExercicioSql);
            // Se o usuário completou todos, retorna uma mensagem de conclusão
            if(ultimaPosicao >= primeiroExercicioResult[0].total_exercicios) {
                 return res.status(404).json({ message: 'Trilha concluída! Parabéns!' });
            }
            res.json(primeiroExercicioResult[0]);
        }

    } catch (error) {
        logger.error(`Erro ao buscar próximo exercício para o usuário ${usuario_ID}:`, { stack: error.stack });
        res.status(500).json({ message: 'Erro ao calcular próximo exercício.' });
    }
});

/*---------------------------------------------------------------------------------*/
// Rota da API - ATUALIZAÇÃO DE USUÁRIO E CONFIGS
/*---------------------------------------------------------------------------------*/

// ATUALIZAR PARCIALMENTE O USUÁRIO (ex: apenas o nome)
app.put("/api/usuarios/:id", async (req, res) => {
    const { id } = req.params;
    // Pega apenas os campos que foram enviados no corpo da requisição
    const { usuario_nome } = req.body;

    // Validação para garantir que algo está sendo enviado para atualização
    if (!usuario_nome) {
        return res.status(400).json({ message: "Nenhum dado para atualizar foi fornecido." });
    }

    try {
        const sql = "UPDATE usuarios SET usuario_nome = ? WHERE usuario_ID = ?";
        const result = await query(sql, [usuario_nome, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        res.json({ message: "Usuário atualizado com sucesso!" });

    } catch (error) {
        logger.error(`Erro ao atualizar usuário com ID ${id}:`, { stack: error.stack });
        res.status(500).json({ message: "Erro interno no servidor." });
    }
});


// ATUALIZAR OU CRIAR CONFIGURAÇÕES DO USUÁRIO (TEMA)
app.put('/api/configuracoes/:usuario_ID', async (req, res) => {
    const { usuario_ID } = req.params;
    const { tema } = req.body;

    if (!tema) {
        return res.status(400).json({ message: "O tema é obrigatório." });
    }

    try {
        // Esta query usa "INSERT ... ON DUPLICATE KEY UPDATE",
        // que insere um novo registro se não existir, ou atualiza o existente.
        // Requer uma chave primária ou única na tabela (config_ID ou usuario_ID se for unique).
        // Para isso funcionar, vamos assumir que usuario_ID na tabela 'configuracoes_usuario' é UNIQUE.
        // ALTER TABLE configuracoes_usuario ADD UNIQUE (usuario_ID);
        const sql = `
            INSERT INTO configuracoes_usuario (usuario_ID, tema) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE tema = ?
        `;
        await query(sql, [usuario_ID, tema, tema]);
        res.json({ message: 'Tema salvo com sucesso!' });

    } catch (error) {
        logger.error(`Erro ao salvar tema para o usuário ${usuario_ID}:`, { stack: error.stack });
        res.status(500).json({ message: "Erro ao salvar configurações." });
    }
});