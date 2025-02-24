require('dotenv').config();

const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT,
  queueLimit: 0
});

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const closeConnection = () => {
  pool.end(err => {
    if (err) {
      console.log('Erro ao fechar a conexão:', err);
    } else {
      console.log('Conexão com o banco de dados encerrada');
    }
  });
};

module.exports = { query, closeConnection };
