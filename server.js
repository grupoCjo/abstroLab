const winston = require("winston");
const path = require("path");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { query, closeConnection } = require('backEndRepository/dbConnection');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());


// Configuração da conexão com o MySQL usando as variáveis do .env
const db = mysql.createConnection({
    host: process.env.DB_HOST,      
    user: process.env.DB_USER,      
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306    
});

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
