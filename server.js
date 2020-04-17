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


// all of my roat ---------------------------------------------------------------------------------------
app.get('/',getDataBaseSaved);
app.get('/find',findBook);
app.post('/searches',searchBook);
app.post('/add',addBook);
app.get('/detail/:id',detailBook);
app.post('/update/:id',updateDataBase);
app.post('/delete/:id',deleteBook);


// all of my functions------------------------------------------------------------------------------------
function findBook(req,res){
  res.render('pages/searches/show');
}

function detailBook(req,res){
  let valOf = [req.params.id];
  let SQL = "SELECT * FROM selectedBook WHERE id=$1;"
  return client.query(SQL,valOf)
  .then(results=> {
    res.render('pages/books/detail', {books:results.rows[0]});
  })
}
 

function getDataBaseSaved(req,res){
    let SQL = 'SELECT * FROM selectedBook;';
    return client.query(SQL)
    .then(results =>{
        res.render('pages/index',{books:results.rows});
    })
}

function addBook(req,res) {
    let {author,title,isbn,image_url,book_description,bookshelf} = req.body;
    let SQL = 'INSERT INTO selectedBook (author,title,isbn,image_url,book_description,bookshelf) VALUES ($1,$2,$3,$4,$5,$6);';
    let safeValues = [author,title,isbn,image_url,book_description,bookshelf];
    return client.query(SQL,safeValues)
    .then (results =>{
        res.redirect('/');
    })
}
 function updateDataBase(req,res){
  let {author,title,isbn,image_url,book_description,bookshelf} = req.body;
  let SQL = 'UPDATE selectedBook SET author=$1,title=$2,isbn=$3,image_url=$4,book_description=$5,bookshelf=$6 WHERE id=$7;';
  let safeValues = [author,title,isbn,image_url,book_description,bookshelf,Number(req.params.id)];
    return client.query(SQL,safeValues)
    .then (results =>{
        res.redirect(`/detail/${req.params.id}`);
    })
 }

 function deleteBook(req,res){
  let SQL = 'DELETE FROM selectedBook WHERE id=$1';
  let safeValue = [Number(req.params.id)];
  client.query(SQL, safeValue)
  .then(res.redirect('/'))
 }

 function searchBook(req,res){
    const qSearch = req.body.search;
    const titleC = req.body.title;
    const auterC = req.body.auther;
    if (auterC){
        bookGet(qSearch,auterC )
        .then(array =>{
            res.render('pages/searches/new', {bookKey:array});
        })
    }
    else{
        bookGet1(qSearch,titleC )
        .then(array =>{
            res.render('pages/searches/new', {bookKey:array});
        })
    }
   }


function bookGet(qSearch,auterC){
    let url = `https://www.googleapis.com/books/v1/volumes?q=inauter:${qSearch}`;
      return superagent.get(url)
        .then(bookData => {
          return bookData.body.items.map( val =>{
            return new Book(val) ;
          });
        });
    }
    


function bookGet1(qSearch,titleC){
    let url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${qSearch}`;
      return superagent.get(url)
        .then(bookData => {
         return bookData.body.items.map( val =>{
         return new Book(val) ;
          });
        });
    }


 // constructor---------------------------------------------------------------------------------------------------   
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
    
    this.isbn = bookData.volumeInfo.industryIdentifiers ? bookData.volumeInfo.industryIdentifiers[0].identifier : '00';
    
   
}

// error handel-----------------------------------------------------------------------------------
app.use(error);
app.get('*', notFoundError);

function notFoundError(req,res){
  res.render('pages/error');
}


function error (req,res) {
  res.render('pages/error');
}

// start listening ----------------------------------------------------------------------------------
client.connect()
  .then(() =>{
    app.listen(PORT , () => {
      console.log(`lestining to PORT  ${PORT}`);
    });
  });
