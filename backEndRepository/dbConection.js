
// const mysql = require('mysql2');


// const sql = mysql.createPool({
//   host: '',      
//   user: '',           
//   password: '',
//   database: '', 
//   waitForConnections: true, 
//   queueLimit: 0           
// });

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    sql.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const closeConnection = () => {
  sql.end(err => {
    if (err) {
      console.log('Erro ao fechar a conexão:', err);
    } else {
      console.log('Conexão com o banco de dados encerrada');
    }
  });
};

module.exports = { query, closeConnection };
