const express = require('express');
require('dotenv').config()
const cors = require('cors')
const app = express()
const port = process.env.PORT

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_DB_URI;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // await client.connect();

    const database = client.db('tripnest_db');
    const ticketCollection = database.collection('tickets');

    app.post('/api/tickets', async (req, res) => {
      const ticket = req.body;
      const result = await ticketCollection.insertOne(ticket);
      res.send(result)
    })
    // app.get('/api/tickets', async (req, res) => {
    //   const result = await ticketCollection.find().toArray();
    //   res.send(result)
    // })
    app.get('/api/tickets', async (req, res) => {
      const query = {};
      if (req.query.operator) {
        query.operator = req.query.operator;
      }
      if (req.query.status) {
        query.status = req.query.status;
      }
      const cursor = await ticketCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})