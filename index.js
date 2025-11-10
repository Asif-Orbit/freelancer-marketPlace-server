const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Smart Deal Server is Running!");
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("freelancerDB");
    const productsCollection = db.collection("Jobs");

    app.get("/allJobs", async (req, res) => {
      try {
        const jobs = await productsCollection.find().toArray();
        res.status(200).send(jobs);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to fetch jobs" });
      }
    });

    app.post("/allJobs", async (req, res) => {
      const newJob = req.body;
      const jobWithDate = {
        ...newJob,
        postedAt: new Date(),
      };
      const result = await productsCollection.insertOne(jobWithDate);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`smart deal server is running on port : ${port}`);
});
