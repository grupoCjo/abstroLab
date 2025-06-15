require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10, // Definido um valor padrão
  queueLimit: 0,
  connectTimeout: 20000
});

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) {
        return reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const closeConnection = () => {
  pool.end(err => {
    if (err) {
      console.error('Erro ao fechar a conexão do pool:', err); // Usar console.error para erros
    } else {
      console.log('Conexão com o banco de dados encerrada');
    }
  });
};

module.exports = { query, closeConnection };