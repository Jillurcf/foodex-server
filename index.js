const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
     
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wfumfky.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// middleware created by me
const logger = async (req, res, next) => {
  console.log("called", req.host, req.originalUrl);
  next();
};

const verifyToken = async(req, res, next)=>{
  const token = req?.cookies?.token;
  if(!token){
    return res.status(401).send({message: 'unauthorized access'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, docoded)=>{
    if(err){
      return res.status(401).send({message: 'unauthorized access' })
    }
    req.user = docoded;
    next()
  })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const allFoodCollection = client.db("allFoodDB").collection("allFood");
    const userCollection = client.db("userDB").collection("user");
    
    // AllFood Related Api
    app.get('/api/v1/allFood', async(req, res)=>{
    
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size)
      console.log('pagination', req.query);
        const result = await allFoodCollection.find()
        .skip(page * size)
        .limit(size)
        .toArray();
        res.send(result);
    })

    // Pagination related api
       app.get('/api/v1/allFoodCount', async(req, res)=>{
      const count = await allFoodCollection.estimatedDocumentCount();
      res.send({count}); 
      console.log({count});
    })
    // user related api

    app.post('/api/v1/user', async(req, res)=>{
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result)
      console.log(result);

    })

     // auth related api

     app.post('/jwt', async(req, res) =>{
      const user = req.body;
      console.log('user for token', user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
      res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        
    })
      .send({success: true})
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




app.get('/', (req, res)=>{
    res.send('assignment11 is running')
})

app.listen(port, () => {
    console.log(`assignment11 server is running ${port}`);
  });
  