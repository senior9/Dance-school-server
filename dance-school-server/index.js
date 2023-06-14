require('dotenv').config();
const express =require('express');

const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const userCollection = client.db("danceCollection").collection("users");
    const classCollection = client.db("danceCollection").collection("classCollection");
    const cartCollection = client.db("danceCollection").collection("carts");



  // Create User 
app.get('/users',async(req,res)=>{
  const result = await userCollection.find().toArray();
  res.send(result)
})


  app.post('/users',async(req,res)=>{
    const user = req.body;
    const query = {email:user.email};
    const existUser = await userCollection.findOne(query);
    if(existUser){
      return res.send({message:"User aalready Exist"})
    }
    const result =await userCollection.insertOne(user);
    res.send(result);
  })

// class ccollection
      app.get('/classCollection',async(req,res)=>{
        const result = await classCollection.find().toArray();
        res.send(result);
      })

      // get cart 
      app.get('/carts',async(req,res)=>{
        const email = req.query.email;
        if(!email){
          res.send([]);
        }
        const query = {email: email}
        const result = await cartCollection.find().toArray();
        res.send(result);
      })
      // cart collections 
      app.post('/carts',async(req,res)=>{
        const cartItem = req.body;
        const result= await cartCollection.insertOne(cartItem);
        res.send(result);
      })
      // delete method 
      app.delete('/carts/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await cartCollection.deleteOne(query);
        res.send(result);
        })
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