require('dotenv').config();
const express =require('express');
var jwt = require('jsonwebtoken');

const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port =  process.env.PORT || 5000;
const  cors = require('cors');


// Middleware
app.use(cors());
app.use(express.json());

// stripe 
const stripe = require("stripe")(process.env.PAYMENT_SECRECT_KEY);

// VerifyJWT 

const verifyJsonWebToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}


app.get("/", (req,res)=>{
    res.send("Server is Running");
    console.log("Hello world")
})



const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.rgmq1mr.mongodb.net/?retryWrites=true&w=majority`;



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
    // await client.connect();
    const userCollection = client.db("danceCollection").collection("users");
    const classCollections = client.db("danceCollection").collection("classCollection");
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


// Admin MiddleWare 
 const verifyAdmin = async(req,res,next)=>{
  const email = req.decoded.email;
  const query ={email: email}
  const user =await userCollection.findOne(query);
  if(user?.role !=='admin'){
    res.status(403).send({ error: error.message });
  }
  next();
 }
// Instructor  MiddleWare 
 const verifyInstructor = async(req,res,next)=>{
  const email = req.decoded.email;
  const query ={email: email}
  const user =await userCollection.findOne(query);
  if(user?.role !=='instructor'){
    res.status(403).send({ error: error.message });
  }
  next();
 }

//   Admin ROle get Method 



// Admin Role Get Method
app.get('/users/admin/:email', async (req, res) => {
    const email = req.params.email;
    // const decodedEmail = req.decoded.email;
  
    // if (email !== decodedEmail) {
    //   res.send({ admin: false });
    //   return; // Add an early return here to prevent further execution
    // }
  
    const query = { email: email };
    const user = await userCollection.findOne(query);
  
    if (user && user.role === 'admin') {
      res.send({ admin: true });
    } else {
      res.send({ admin: false });
    }
  });

//   Admin update 
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


  // Instructor Role 
// Instructor Role Get Method

  app.get('/users/instructor/:email', async (req, res) => {
    const email = req.params.email;
    // const decodedEmail = req.decoded.email;
  
    // if (email !== decodedEmail) {
    //   res.send({ admin: false });
    //   return; // Add an early return here to prevent further execution
    // }
  
    const query = { email: email };
    const user = await userCollection.findOne(query);
  
    if (user && user.role === 'instructor') {
      res.send({ instructor: true });
    } else {
      res.send({ instructor: false });
    }
  });
  
  // Instructor Update

  app.patch('/users/instructor/:id', async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) {
        throw new Error('Invalid ID');
      }
  
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "instructor"
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
        const email = req.query.email;
        const query ={email:email};

        // const { status } = req.query;
        // const query = status ? { status } : { status: { $ne: 'pending' } };
        const result = await classCollections.find(query).toArray();
        res.send(result);
      })

    // classCollecton Insert method 
      app.post('/classCollection',async(req,res)=>{

        const newClassCollection = req.body;
        const result = await classCollections.insertOne(newClassCollection);
        res.send(result)
      })
      // Delete method 
      app.delete('/classCollection/:id', async(req,res)=>{
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await classCollections.deleteOne(query);
        res.send(result);
      })

      // get cart 
      app.get('/carts',async(req,res)=>{
        const email = req.query.email;
        if(!email){
          res.send([]);
        }
        const query = {email: email}
        const result = await cartCollection.find(query).toArray();
        res.send(result);
      })
     // cart collections
app.post('/carts', async (req, res) => {
  const email = req.query.email;
  const cartItem = { ...req.body, email: email };
  const result = await cartCollection.insertOne(cartItem);
  res.send(result);
});


      // delete method 
      app.delete('/carts/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await cartCollection.deleteOne(query);
        res.send(result);
        })


    // craete payment method 

    app.post("/create-payment-intent",verifyJsonWebToken, async (req, res) => {

      const {price}=req.body;
      const amount = price*100;


      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types:['card']
        
      });
      // const confirmation = await stripe.paymentIntents.confirm(paymentIntent.id);
      // res.send({
      //   clientSecret: paymentIntent.client_secret,
      // });

    })

    // Popular class Section get 

    // Get popular classes
app.get('/popular-classes', async (req, res) => {
  const limit = req.query.limit || 6; // Set a default limit if not provided
  const result = await classCollections.find().sort({ students: -1 }).limit(parseInt(limit)).toArray();
  res.send(result);
});

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);




app.listen(port,()=>{
    console.log("apps running ")
})