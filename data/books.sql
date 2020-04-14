DROP TABLE IF EXISTS selectedBook;
CREATE TABLE selectedBook (
    id SERIAL PRIMARY KEY,
    author VARCHAR(255),
    title VARCHAR(255),
    isbn TEXT,
    image_url VARCHAR(255),
    book_description TEXT ,
    bookshelf VARCHAR(255)
);
