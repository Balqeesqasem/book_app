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
app.post('/add',addBook); 

function getDataBaseSaved(req,res){
    let SQL = 'SELECT * FROM selectedBook;';
    return client.query(SQL)
    .then(results =>{
        res.render('pages/index',{books:results.rows});
    })
}

    function addBook(req,res) {
     console.log(req.body);
    let {author,title,isbn,image_url,book_description,bookshelf} = req.body;
    let SQL = 'INSERT INTO selectedBook (author,title,isbn,image_url,book_description,bookshelf) VALUES ($1,$2,$3,$4,$5,$6);';
    let safeValues = [author,title,isbn,image_url,book_description,bookshelf];
    return client.query(SQL,safeValues)
    .then (()=>{
        res.redirect('/');
    })
}
// function getBookDetails(req,res) {
//     console.log(req.params.books_id);
//     let SQL = 'SELECT * FROM tasks WHERE id=$1;';
//     let values = [req.params.task_id];
//     return client.query(SQL,values)
//     .then (result =>{
//         res.render('BookDetails',{books:result.rows[0]});
//     })
// }
// app.get('/addBook',showBook);

// app.get('/details/:task_id', getBookDetails);

// function showBook (req,res) {
//     res.render('addBook',{books:results.rows});
// }


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

client.connect()
  .then(() =>{
    app.listen(PORT , () => {
      console.log(`lestining to PORT  ${PORT}`);
    });
  });

//const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:`
//const url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:`