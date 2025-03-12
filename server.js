const express = require("express");
const winston = require("winston");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
  
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
