const express = require("express");
const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res)=>{
    res.send('assignment11 is running')
})

app.listen(port, () => {
    console.log(`assignment11 server is running ${port}`);
  });
  