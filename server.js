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

app.get('/trilha', (req, res) => {
  res.sendFile(__dirname + '/frontEndRepository/trilha.html');
});


// Servir arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pagina-inicial.html'));
});

//gera novo ID para usuário. aqui foi feito um select para pegar o último ID cadastrado e incrementar 1 para gerar novo ID.
// POST /api/usuarios/criar
app.post('/api/usuarios/criar', async (req, res) => {
  try {
    const { usuario_nome, usuario_data_nascimento, usuario_email } = req.body;

    const sql = `
      INSERT INTO usuarios (usuario_nome, usuario_data_nascimento, usuario_email) 
      VALUES (?, ?, ?)
    `;

    const result = await db.query(sql, [usuario_nome, usuario_data_nascimento, usuario_email]);

    // Pega o ID gerado pelo AUTO_INCREMENT
    res.status(201).json({ message: 'Usuário criado com sucesso', usuario_ID: result.insertId });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

//endpoint para gerar o ID dos exercícios, sequencial e único
//PARA EXERCÍCIOS COM ID = XXXX (INT)
const gerarExercicioID = async () => {
  try {
      const resultado = await query("SELECT MAX(exercicio_ID) AS ultimoID FROM exercicios");
      const ultimoID = resultado[0].ultimoID;

      if (!ultimoID) {
          return "0001";
      }

      const numero = parseInt(ultimoID) + 1; //
      return numero.toString().padStart(4, "0"); 
  } catch (error) {
      console.error("Erro ao gerar ID do exercício:", error);
      throw error;
  }
};

/*PARA EXERCÍCIOS COMID EX001
  const gerarExercicioID = async () => {
  try {
      const resultado = await query("SELECT MAX(exercicio_ID) AS ultimoID FROM exercicios");
      const ultimoID = resultado[0].ultimoID;

      if (!ultimoID) {
          return "0001";
      }

      const numero = parseInt(ultimoID.substring(2)) + 1;
      return `${numero.toString().padStart(3, "0")}`;
  } catch (error) {
      console.error("Erro ao gerar ID do exercício:", error);
      throw error;
  }
};*/

//endpoint que permite subir arquivos em lote
app.post('/api/exercicios/criar', async (req, res) => {
  const exercicios = req.body;

  if (!Array.isArray(exercicios) || exercicios.length === 0) {
      return res.status(400).json({ error: 'Envie uma lista de exercícios!' });
  }

  try {
      for (const exercicio of exercicios) {
          // Validação básica
          if (!exercicio.posicao_trilha || !exercicio.titulo || !exercicio.enunciado ||
              !exercicio.alternativas || !exercicio.resposta_correta || !exercicio.nivel) {
              return res.status(400).json({ error: 'Todos os campos são necessários em cada exercício' });
          }

          const novoID = await gerarExercicioID();

          const querySQL = `
              INSERT INTO exercicios (exercicio_ID, posicao_trilha, titulo, enunciado, alternativas, resposta_correta, nivel)
              VALUES (?, ?, ?, ?, ?, ?, ?)`;

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

//endpoint de cadastro
app.post("/cadastrar", async (req, res) => {
    const { nome, email, senha, dataNascimento } = req.body;

    if (!nome || !email || !senha || !dataNascimento) {
        return res.status(400).json({ message: "Preencha todos os campos!" });
    }

    try { //notem o uso de try e catch para fazer tratativa de erros. 
    // DICA: sempre façam a tratativa de erros utilizando esses comandos 
    // e tratem as exceções de comportamento do usuário desta forma.
        const usuario_ID = await gerarUsuarioID(); //gera novo ID para usuário e é atribuído a constante usuario_ID.
        const sql = "INSERT INTO usuarios (usuario_ID, usuario_nome, usuario_data_nascimento, usuario_email) VALUES (?, ?, ?, ?)"; //feito o insert com os dados de campo cadastro + id gerado.
        await query(sql, [usuario_ID, nome, dataNascimento, email]); //executa o insert no banco de dados de forma assíncrona.

        res.status(201).json({ message: "Usuário cadastrado com sucesso!", usuario_ID });
    } catch (error) { //caso ocorra erro, ele é tratado aqui.
        console.error("Erro ao cadastrar usuário:", error);
        res.status(500).json({ message: "Erro no servidor!" });
    }
});
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
app.get('/exercicios', async (req, res) => {
  try {
      const resultados = await query('SELECT * FROM exercicios ORDER BY posicao_trilha ASC');
      
      if (resultados.length > 0) {
          res.json(resultados);  // Retorna os exercícios em formato JSON
      } else {
          res.status(404).json({ message: "Nenhum exercício encontrado." });
      }
  } catch (error) {
      console.error('Erro ao buscar exercícios:', error);
      res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// Rota para buscar o exercício por ID
app.get('/exercicio/:id', (req, res) => {
  const exercicioID = req.params.id;

  const query = 'SELECT dados_json FROM exercicios WHERE exercicio_ID = ?';
  pool.query(query, [exercicioID], (err, results) => {
      if (err) {
          return res.status(500).json({ message: 'Erro ao buscar exercício' });
      }
      if (results.length === 0) {
          return res.status(404).json({ message: 'Exercício não encontrado' });
      }
      res.json(results[0].dados_json); // Retorna o JSON do exercício
  });
});

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

//Endpoint dos exercicios
app.post('/api/exercicios/criar', (req, res) => {
    const exercicio = req.body;
  
    // Validação dos dados
    /*Pessoal aqui a função checa se há algum campo vazio se tiver ele envia a mensagem que precisa de todos*/
    if (!exercicio.exercicio_ID || !exercicio.posicao_trilha || !exercicio.titulo || !exercicio.enunciado || 
        !exercicio.alternativas || !exercicio.resposta_correta || !exercicio.nivel) {
      return res.status(400).json({ error: 
        'Todos os campos são necessários (exercicio_ID, posicao_trilha, titulo, enunciado, alternativas, resposta_correta, nivel)' });
    }
  
    // Query para inserir o exercício no banco de dados
    /*guarda os comandos em sql para adicionar nas tabelas corretas*/
    const query = `
      INSERT INTO exercicios (exercicio_ID, posicao_trilha, titulo, enunciado, alternativas, resposta_correta, nivel)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
    // Executa a query no banco de dados

    connection.execute(query, [ exercicio.exercicio_ID, exercicio.posicao_trilha,exercicio.titulo, exercicio.enunciado, 
      JSON.stringify(exercicio.alternativas), // Converte o array p string do json (não sei se ta certo )
      exercicio.resposta_correta, exercicio.nivel], 
      (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao inserir exercício', details: err });
      }
      res.status(201).json({
        message: 'Exercício criado com sucesso!',
        id: results.insertId // Retorna o id do exercício inserido
      });
    });
  });

//Novas Requisições
//Req/Get - Consultar um usuário específico
app.get("/usuarios/:id", (req, res) => {
    const { id } = req.params;
  
    db.query("SELECT * FROM usuarios WHERE usuario_ID = ?", [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (results.length === 0) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }
      
      res.json(results[0]);
    });
});
  
//Req/Put - Atualizar info usuário
app.put("/usuarios/:id", (req, res) => {
    const { id } = req.params;
    const { usuario_nome, usuario_data_nascimento, usuario_email } = req.body;
  
    db.query(
      "UPDATE usuarios SET usuario_nome = ?, usuario_data_nascimento = ?, usuario_email = ? WHERE usuario_ID = ?",
      [usuario_nome, usuario_data_nascimento, usuario_email, id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Usuário atualizado com sucesso!" });
      });
});
  
//Req/Delete - Exluir um usuário
app.delete("/usuarios/:id", (req, res) => {
    const { id } = req.params;
  
    db.query("DELETE FROM usuarios WHERE usuario_ID = ?", [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Usuário deletado com sucesso!" });
    });
});
  
  
//Req/Post??? - Criar uma nova sessão
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

/*app.get('/exercicios/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  // Aqui você buscaria o exercício real no banco de dados
  const exemplo = {
    titulo: "Quantas maçãs há na cesta?",
    enunciado: "Olhe para a imagem da cesta de frutas e conte quantas maçãs estão nela.",
    alternativa_1: "2",
    alternativa_2: "3",
    alternativa_3: "4",
    alternativa_4: "5",
    resposta_correta: 2
  };
  res.json(exemplo);
});

app.get('/exercicios/:codigo', (req, res) => {
  const codigo = req.params.codigo;

 const exercicio = exercicios.find(e => e.exercicio_codigo === codigo);

  if (exercicio) {
    res.json(exercicio);
  } else {
    res.status(404).json({ erro: 'Exercício não encontrado' });
  }
});*/

app.get('/exercicios/:codigo', (req, res) => {
  const { codigo } = req.params;

  if (!exercicios || !Array.isArray(exercicios)) {
    return res.status(500).json({ erro: 'Lista de exercícios não está disponível' });
  }

  const exercicio = exercicios.find(e => e.exercicio_codigo === codigo);

  if (!exercicio) {
    return res.status(404).json({ erro: 'Exercício não encontrado' });
  }

  try {
    const alternativas = JSON.parse(exercicio.alternativas); // Faz o parse do JSON em string
    const alternativa_1 = alternativas["1"];
    const alternativa_2 = alternativas["2"];
    const alternativa_3 = alternativas["3"];
    const alternativa_4 = alternativas["4"];

    const resposta_correta = Object.keys(alternativas).find(
      key => alternativas[key] === exercicio.resposta_correta
    );

    res.json({
      titulo: exercicio.titulo,
      enunciado: exercicio.enunciado,
      alternativa_1,
      alternativa_2,
      alternativa_3,
      alternativa_4,
      resposta_correta: Number(resposta_correta)
    });

  } catch (error) {
    console.error("Erro ao processar exercício:", error);
    res.status(500).json({ erro: "Erro interno ao processar o exercício" });
  }
});
