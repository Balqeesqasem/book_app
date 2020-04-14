'use strict'

require('dotenv').config();
const express = require('express');

const PORT = process.env.PORT || 3000;
const app = express();
const path =require('path');
const superagent = require('superagent');
const pg = require('pg');
app.use(express.static('./public'));

//creat the connection our server now client ! connect server to database
const client = new pg.Client(process.env.DATABASE_URL);

//get all data from the form data to body 
app.use(express.json());
app.use(express.urlencoded({extended:true}));


//tell the browser that iam using ejs
app.set('view engine', 'ejs'); 

app.get('/',getDataBaseSaved);
app.get('/find',(req,res)=>{
    res.render('pages/searches/show');
})
app.get('/detail/:id',(req,res)=>{
let valOf = [req.params.id];
let SQL = "SELECT * FROM selectedBook WHERE id=$1;"
return client.query(SQL,valOf)
.then(results=> {
  res.render('pages/books/detail', {books:results.rows[0]});
})
  
})

app.post('/add',addBook); 
//app.post('/add/:id',addBook); 
function getDataBaseSaved(req,res){
    let SQL = 'SELECT * FROM selectedBook;';
    return client.query(SQL)
    .then(results =>{
      //console.log("hhhhhhhhhhhhhh",results.rows);
        res.render('pages/index',{books:results.rows});
    })
}

    function addBook(req,res) {
     //let va = req.params.id;
    let {author,title,isbn,image_url,book_description,bookshelf} = req.body;
    //console.log(req.body);
    let SQL = 'INSERT INTO selectedBook (author,title,isbn,image_url,book_description,bookshelf) VALUES ($1,$2,$3,$4,$5,$6);';
    let safeValues = [author,title,isbn,image_url,book_description,bookshelf];
    return client.query(SQL,safeValues)
    .then (results =>{
        res.redirect('/');
    })
}

app.post('/searches',(req,res)=>{
    const qSearch = req.body.search;
    const titleC = req.body.title;
    const auterC = req.body.auther;
    //console.log(req.body);
    if (auterC){
        bookGet(qSearch,auterC )
        .then(array =>{
            res.render('pages/searches/new', {bookKey:array});
        })
    }
    else{
        //console.log('hghghh')
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
         //console.log('mmmmmmmmmmmmmmmm',val);
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
    this.authors = bookData.volumeInfo.authors ? bookData.volumeInfo.authors[0] : 'No Author found';
    
    if(bookData.volumeInfo.description===  undefined){
        this.description="No description";
    }
    else{
        this.description=bookData.volumeInfo.description;
    }
    
    this.isbn = bookData.volumeInfo.industryIdentifiers[0].identifier ? bookData.volumeInfo.industryIdentifiers[0].identifier : '00';
    
   
}

app.use(error);
app.get('*', notFoundError);

function notFoundError(req,res){
  res.render('pages/error');
}


function error (req,res) {
  res.render('pages/error');
}

client.connect()
  .then(() =>{
    app.listen(PORT , () => {
      console.log(`lestining to PORT  ${PORT}`);
    });
  });

//const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:`
//const url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:`