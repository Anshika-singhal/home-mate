const express=require('express');
const mongoose=require('mongoose');
const bodyParser =require('body-parser');
var cors = require('cors');
var cookieParser = require('cookie-parser');
const axios = require('axios');
const categories=require('./routes/categories');
const users = require('./routes/auth');
const app=express();

app.use(cors());
require('dotenv').config();
const mongourl=process.env.database;
//work as a middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api',users);
app.use(express.json());
//mongoose.connect
mongoose.connect(mongourl)
.then(()=>console.log('mongoDb contted'))
.catch(err=>console.log(err));

// app.use('/api',authRouter);
// app.use(express.json());
//routes



app.use('/api',categories);
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>console.log(`server conected on part ${PORT}`))


