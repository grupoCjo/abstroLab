import express from 'express';
import { request } from 'axios/index.d.cts';
const env = require('env').config().parsed;
const app = express();
const port = process.env.PORT || 3000;
const key = env.EMOJI_API_KEY;

const getEmojis = async () => {
  try {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://emoji-api.com/emojis?access_key=fae${key}`,
      headers: { 
        'Cookie': 'PHPSESSID=bj04h91qu4v7su7qh7ma1hvrnt'
      }
    };
    
    const response = await request(config);
    
    return response.data;
  } catch (error) {
    console.error('Erro ao obter os emojis:', error);
    throw error;
  }
};

app.use('/emojis', async (req, res) => {
  try {
    const emojis = await getEmojis();
    
    res.json(emojis);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar emojis', error: error.message });
  } 
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
     