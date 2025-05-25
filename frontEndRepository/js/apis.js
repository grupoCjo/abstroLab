import express from 'express'; // importa a biblioteca express
import axios from 'axios'; // importa a biblioteca axios
const env = require('dotenv').config().parsed; // lê as variáveis do arquivo .env
const app = express(); // cria o servidor express
const port = process.env.PORT || 3000; // define a porta do servidor
const key = env.EMOJI_API_KEY; // pega a chave da API de emojis do .env

// função assíncrona que busca emojis
const getEmojis = async () => {
  try {
    let config = { 
      method: 'get', // método GET
      maxBodyLength: Infinity, 
      url: `https://emoji-api.com/emojis?access_key=${key}`, // URL com a chave correta
    };

    const response = await axios(config); // faz a requisição e espera a resposta

    return response.data; // retorna os dados da resposta
  } catch (error) { 
    console.error('Erro ao obter os emojis:', error); // mostra o erro no console
    throw error; // lança o erro para ser tratado por quem chamou a função
  }
};
//essa função? a outra pega os emojis, essa ???w
app.use('/emojis', async (req, res) => {
  try {
    const emojis = await getEmojis();
    
    res.json(emojis);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar emojis', error: error.message });
  } 
});
//essa é apenas para checar o funcionamento do server, right?
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
     