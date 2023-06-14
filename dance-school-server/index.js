require('dotenv').config();
const express =require('express');
var jwt = require('jsonwebtoken');

const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port =  process.env.PORT || 5000;
const  cors = require('cors');

// var web = "ad9237eb189f001c5cd84befca155ceac6fd3385e8ad879da8f30b07c51a25c3593582dcb263577365b6f41047a2c21471375c9f35f2d6856289b5718d344d0a";
// Middleware

app.use(cors());
app.use(express.json());


app.get("/", (req,res)=>{
    res.send("Server is Running");
    console.log("Hello world")
})



const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.rgmq1mr.mongodb.net/?retryWrites=true&w=majority`;
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_PASSWORD:", process.env.ACCESS_TOKEN);


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

// JWT 
app.post('/jwt',(req,res)=>{
  const user = req.body ;
  const token = jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn:'1h'})
  res.send(token)
})

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

  app.patch('/users/admin/:id', async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) {
        throw new Error('Invalid ID');
      }
  
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin"
        }
      };
  
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });
  
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