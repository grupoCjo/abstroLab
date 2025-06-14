require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const mysql = require('mysql2'); // Importa a biblioteca mysql2 (permite conexão do Node.js com o MySQL)


/*-------------------------------------------------------------------------------------
POOL def:
agrupamento de recursos (como conexões de banco de dados, threads ou objetos) 
que são mantidos disponíveis para reutilização, 
evitando a necessidade de criar e destruir esses recursos constantemente
--------------------------------------------------------------------------------------*/

// essa função pool é para pegar os dados do banco, tentar conectar e checar êxito
const pool = mysql.createPool({ 
  host: process.env.DB_HOST,            // Pega o host do banco de dados do arquivo .env
  user: process.env.DB_USER,            // Usuário do banco
  password: process.env.DB_PASSWORD,    // Senha do banco
  database: process.env.DB_DATABASE,  // Nome do banco de dados
  port: process.env.PORT,   //PORTA DO DB
  waitForConnections: true,             // Fica aguardando caso as conexões estejam ocupadas
  connectionLimit: process.env.DB_CONNECTION_LIMIT, // Limite máximo de conexões simultâneas
  queueLimit: 0                         // Sem limite de fila para requisições pendentes
});


const query = (sql, params) => { 
  // Função para executar consultas no banco de dados. 
  // Recebe um comando SQL e parâmetros para evitar SQL Injection.
  return new Promise((resolve, reject) => { 
    // Retorna uma Promise (algo que será resolvido ou rejeitado no futuro).
    pool.query(sql, params, (err, results) => { 
      // Executa a consulta usando o pool e verifica se há erro ou resultados.
      if (err) {
        reject(err); // Se der erro, rejeita a Promise
      } else {
        resolve(results); // Se der certo, resolve a Promise retornando os resultados
      }
    });
  });
};


//Essa é para fechar a conexão
const closeConnection = () => { 
  pool.end(err => { // pool.end fecha todas as conexões abertas no pool
    if (err) { 
      console.log('Erro ao fechar a conexão:', err); 
    } else {
      console.log('Conexão com o banco de dados encerrada'); 
    }
  });
};


module.exports = { query, closeConnection }; 
// Exporta as funções permitindo que sejam usadas em outros arquivos
/*
essa última parte permite que qualquer outro arq utilize
---const db = require('dbconection.js');

Vai poder usar:
--- db.query('SELECT * FROM usuarios') 
ou 
--- db.closeConnection();
*/
