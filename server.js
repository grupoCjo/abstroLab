const winston = require("winston");
const path = require("path");
require("dotenv").config();
const express = require("express");
//const cors = require("cors");
const { query, closeConnection } = require('./backEndRepository/dbConnection');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
//app.use(cors());

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


//gera novo ID para usuário. aqui foi feito um select para pegar o último ID cadastrado e incrementar 1 para gerar novo ID.
const gerarUsuarioID = async () => {
    try {
        const resultado = await query("SELECT MAX(usuario_ID) AS ultimoID FROM usuarios");
        const ultimoID = resultado[0].ultimoID;

        if (!ultimoID) {
            return "U000001";
        }

        const numero = parseInt(ultimoID.substring(1)) + 1;
        return `U${numero.toString().padStart(6, "0")}`;
    } catch (error) {
        console.error("Erro ao gerar ID:", error);
        throw error;
    }
};

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