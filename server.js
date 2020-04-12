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


//tell the browser that iam using ejs
app.set('view engine', 'ejs'); 

app.listen(PORT , () =>{
    console.log(`Here we go ${PORT}`)
}) 

app.get('/',(req,res)=>{
    res.render('pages/searches/show');
})

app.post('/searches',(req,res)=>{
    const qSearch = req.body.search;
    const titleC = req.body.title;
    const auterC = req.body.auther;
    console.log(req.body);
    if (auterC){
        bookGet(qSearch,auterC )
        .then(array =>{
            res.render('pages/searches/new', {bookKey:array});
        })
    }
    else{
        console.log('hghghh')
        bookGet1(qSearch,titleC )
        .then(array =>{
            res.render('pages/searches/new', {bookKey:array});
        })
    }
   })

function bookGet(qSearch,auterC){
let url = `https://www.googleapis.com/books/v1/volumes?q=inauter:${qSearch}`;
  return superagent.get(url)
    .then(bookData => {
      //console.log(bookData.body);
      return bookData.body.items.map( val =>{
     //console.log('gggggggggggggggggg',val);
        return new Book(val) ;
      });
    });
}

function bookGet1(qSearch,titleC){
    let url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${qSearch}`;
      return superagent.get(url)
        .then(bookData => {
          //console.log(bookData.body);
          return bookData.body.items.map( val =>{
         //console.log('gggggggggggggggggg',val);
            return new Book(val) ;
          });
        });
    }
    
function Book(bookData){
    if(bookData.volumeInfo.imageLinks ===  undefined){
      this.imge="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcS1rHJ7zb-eZK0q1xB7YJ58Rq9VdwAnTOMwWKcc_X-3Y0NUXYgM&usqp=CAU";
    }
    else{
        this.imge=bookData.volumeInfo.imageLinks.smallThumbnail;
    }
    if (bookData.volumeInfo.title ===  undefined){
        this.title="There is no title"
    }
    else{
        this.title=bookData.volumeInfo.title;
    }
    if(bookData.volumeInfo.authors ===  undefined){
        this.auther=" No Auther "
    }
    else{
        this.auther=bookData.volumeInfo.authors;
    }
    
    if(bookData.volumeInfo.description===  undefined){
        this.description="No description";
    }
    else{
        this.description=bookData.volumeInfo.description;
    }
    
}

app.use(error);
app.get('*', notFoundError);

function notFoundError(req,res){
  res.render('pages/error');
}


function error (req,res) {
  res.render('pages/error');
}


//const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:`
//const url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:`