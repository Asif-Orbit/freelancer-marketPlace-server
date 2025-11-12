const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
  res.send("Freelance MarketPlace Server is Running!");
});

async function run() {
  try {
    // Connect the client to the server
    // await client.connect();
    const db = client.db("freelancerDB");
    const jobCollection = db.collection("Jobs");
    const accepted = db.collection("AcceptedTasks");

    app.get("/allJobs", async (req, res) => {
      try {
        const jobs = await jobCollection.find().toArray();
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
      const result = await jobCollection.insertOne(jobWithDate);
      res.send(result);
    });
    app.get("/allJobs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const job = await jobCollection.findOne({ _id: new ObjectId(id) });
        if (!job) return res.status(404).send({ message: "Job not found" });
        res.status(200).send(job);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch job details" });
      }
    });
    app.get("/myAddedJobs", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email)
          return res.status(400).json({ message: "Email query is required" });

        const jobs = await jobCollection
          .find({ userEmail: email })
          .sort({ postedAt: -1 })
          .toArray();
        res.status(200).json(jobs);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch user's jobs" });
      }
    });
    // Accept a job
    app.post("/acceptedTasks", async (req, res) => {
      try {
        const { jobId, userEmail, snapshot } = req.body;
        if (!jobId || !userEmail || !snapshot) {
          return res
            .status(400)
            .json({ message: "jobId, userEmail, snapshot required" });
        }

        const acceptJob = {
          jobId,
          userEmail,
          snapshot,
          createdAt: new Date(),
        };
        const result = await accepted.insertOne(acceptJob);
        res.status(201).json({ insertedId: result.insertedId });
      } catch (e) {
        console.error("POST /acceptedTasks error:", e);
        res.status(500).json({ message: "Failed to accept task" });
      }
    });

    // Get my accepted tasks
    app.get("/acceptedTasks", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email)
          return res.status(400).json({ message: "email query required" });
        const items = await accepted
          .find({ userEmail: email })
          .sort({ createdAt: -1 })
          .toArray();
        res.status(200).json(items);
      } catch (e) {
        console.error("GET /acceptedTasks error:", e);
        res.status(500).json({ message: "Failed to fetch accepted tasks" });
      }
    });

    app.delete("/acceptedTasks/:id", async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id))
          return res.status(400).json({ message: "Invalid id" });
        const result = await accepted.deleteOne({ _id: new ObjectId(id) });
        if (!result.deletedCount)
          return res.status(404).json({ message: "Not found" });
        res.status(200).json({ deleted: true });
      } catch (e) {
        console.error("DELETE /acceptedTasks/:id error:", e);
        res.status(500).json({ message: "Failed to remove task" });
      }
    });
    // UPDATE a job
    app.patch("/allJobs/:id", async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id))
          return res.status(400).json({ message: "Invalid job id" });

        const {
          title,
          category,
          postedBy,
          salaryRange,
          location,
          deadline,
          summary,
          description,
          coverImage,
          userEmail,
          posterEmail,
        } = req.body;

        if (!userEmail)
          return res.status(400).json({ message: "userEmail required" });

        const _id = new ObjectId(id);
        const job = await jobCollection.findOne({ _id });
        if (!job) return res.status(404).json({ message: "Job not found" });

        // owner check
        if (job.userEmail !== userEmail) {
          return res
            .status(403)
            .json({ message: "Forbidden: You can only update your own job." });
        }

        // build update doc (whitelist)
        const updateDoc = {
          ...(title !== undefined && { title }),
          ...(category !== undefined && { category }),
          ...(postedBy !== undefined && { postedBy }),
          ...(salaryRange !== undefined && { salaryRange }),
          ...(location !== undefined && { location }),
          ...(summary !== undefined && { summary }),
          ...(description !== undefined && { description }),
          ...(coverImage !== undefined && { coverImage }),
          ...(posterEmail !== undefined && { userEmail: posterEmail }),
          ...(deadline !== undefined && {
            deadline: deadline ? new Date(deadline) : null,
          }),
          updatedAt: new Date(),
        };

        const result = await jobCollection.updateOne(
          { _id },
          { $set: updateDoc }
        );
        return res.status(200).json({ modifiedCount: result.modifiedCount });
      } catch (e) {
        console.error("PATCH /allJobs/:id error:", e);
        return res.status(500).json({ message: "Failed to update job" });
      }
    });

    app.delete("/allJobs/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { userEmail } = req.query;
        if (!ObjectId.isValid(id))
          return res.status(400).json({ message: "Invalid job id" });
        if (!userEmail)
          return res.status(400).json({ message: "user Email required" });

        const _id = new ObjectId(id);
        const job = await jobCollection.findOne({ _id });
        if (!job) return res.status(404).json({ message: "Job not found" });
        if (job.userEmail !== userEmail)
          return res.status(403).json({ message: "Forbidden" });

        const result = await jobCollection.deleteOne({ _id });
        res.status(200).json({ deletedCount: result.deletedCount });
      } catch (e) {
        res.status(500).json({ message: "Failed to delete job" });
      }
    });

    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Freelance MarketPlace server is running on port : ${port}`);
});
