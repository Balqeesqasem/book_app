'use strict'

require('dotenv').config();
const express = require('express');

const PORT = process.env.PORT || 3000;
const app = express();
const path =require('path');
const superagent = require('superagent');

app.use(express.static('./public'));

//get all data from the form data to body 
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set('views' ,path.join(__dirname , 'views/pages'));
app.set('views' ,path.join(__dirname , 'views/pages/searches'));
//tell the browser that iam using ejs
app.set('view engine', 'ejs'); 

app.get('/hello',(req,res)=>{
    res.render('index');
})

app.get('/searches/new',(req,res)=>{
    res.render('show');
})

app.listen(PORT , () =>{
    console.log(`Here we go ${PORT}`)
})
