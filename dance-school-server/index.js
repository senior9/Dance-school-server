require('dotenv').config();
const express =require('express');

const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port =  process.env.PORT || 5000;
const  cors = require('cors');


// Middleware

app.use(cors());
app.use(express.json());


app.get("/", (req,res)=>{
    res.send("Server is Running");
    console.log("Hello world")
})



const uri = `mongodb+srv://dance-collection:mOXXcjwRsaemJtTj@cluster0.rgmq1mr.mongodb.net/?retryWrites=true&w=majority`;
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port,()=>{
    console.log("apps running ")
})