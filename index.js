const express = require('express');
require('dotenv').config()
const cors = require('cors')
const app = express()
const port = process.env.PORT

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    app.get("/api/tickets/:ticketId", async (req, res) => {
      const { ticketId } = req.params;

      if (!ObjectId.isValid(ticketId)) {
        return res.status(400).send({
          message: "Invalid Ticket ID",
        });
      }

      const result = await ticketCollection.findOne({
        _id: new ObjectId(ticketId),
      });

      if (!result) {
        return res.status(404).send({
          message: "Ticket not found",
        });
      }

      res.send(result);
    });
    app.get("/api/tickets", async (req, res) => {
      const { operator, status } = req.query;

      const query = {};

      if (operator) {
        query.operator = operator;
      }

      if (status) {
        query.status = status;
      }

      const result = await ticketCollection.find(query).toArray();

      res.send(result);
    });
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