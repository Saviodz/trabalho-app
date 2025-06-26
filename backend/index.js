const express = require('express');
const process = require('process');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const redis = require('redis');

const app = express();
app.use(cors());
app.use(express.json());

const mongoUrl = 'mongodb://database:27017';
const redisClient = redis.createClient({ url: 'redis://cache:6379' });
const port = process.env.PORT

async function start() {
  await redisClient.connect();
  const client = await MongoClient.connect(mongoUrl);
  const db = client.db('app');
  const collection = db.collection('items');

  app.get('/items', async (req, res) => {
    try {
      const cached = await redisClient.get('items');
      if (cached) {
        console.log(' Cache usado');
        return res.json(JSON.parse(cached));
      }

      const items = await collection.find().toArray();
      await redisClient.set('items', JSON.stringify(items));
      console.log(' Dados buscados do MongoDB');
      res.json(items);
    } catch (err) {
      console.error('Erro em GET /items:', err);
      res.status(500).json({ error: 'Erro ao buscar itens' });
    }
  });

  app.post('/items', async (req, res) => {
    try {
      console.log('Corpo recebido no POST:', req.body);

      if (!req.body.item) {
        return res.status(400).json({ error: 'Campo "item" ausente' });
      }

      const result = await collection.insertOne({ item: req.body.item });
      await redisClient.del('items');
      console.log('Item inserido:', req.body.item);
      res.json(result);
    } catch (err) {
      console.error('Erro em POST /items:', err);
      res.status(500).json({ error: 'Erro ao inserir item' });
    }
  });

  app.listen(port, () => console.log(`Backend na porta ${port}`));
}

start();
