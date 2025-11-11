const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {

    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // check if username already exists
    const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return res.status(409).json({ message: `Username "${username}" already exists` });
    }
  
    // save the new user
    users.push({ username : username.trim(), password: password.trim() });
  
    return res.status(201).json({ message: `User ${username} was registered successfully.` });

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  
   
return res.status(200).json(books);

});

const axios = require('axios');

// GET list of books via Axios (async)
public_users.get('/axios/books', async (req, res) => {
  try {
    // call your own root endpoint that returns the books
    const { data } = await axios.get('http://localhost:5000/');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch books with Axios',
     error: String(err) });
  }
});

// helper that returns a Promise
const getBooksAsync = () => new Promise((resolve) => resolve(books));

// GET list of books using Promise then/catch
public_users.get('/promise/books', (req, res) => {
  getBooksAsync()
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json({ message: 'Failed to fetch books', 
    error: String(err) }));
});






// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here

  const isbn = req.params.isbn.trim();
  const book = books[isbn];              // strings/numbers both fine as keys

  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  return res.json(book);  
 });
  
// GET book by ISBN using Axios (calls your own /isbn route)
public_users.get('/axios/isbn/:isbn', async (req, res) => {
    try {
      const { isbn } = req.params;
      const base = `${req.protocol}://${req.get('host')}`;
      const { data } = await axios.get(`${base}/isbn/${encodeURIComponent(isbn)}`);
      return res.json(data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return res.status(404).json({ message: `Book with ISBN ${req.params.isbn} not found` });
      }
      return res.status(500).json({ message: 'Failed to fetch book with Axios' });
    }
  });
  const getBookByIsbn = (isbn) =>
  new Promise((resolve, reject) => {
    const book = books[isbn];
    return book ? resolve(book) : reject(new Error('not found'));
  });

public_users.get('/promise/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn.trim();
  getBookByIsbn(isbn)
    .then(book => res.json(book))
    .catch(() => res.status(404).json({ message: `Book with ISBN ${isbn} not found` }));
});











// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here

    const ISBN = req.params.isbn;
    const authors = req.params.author.trim();
    const author = authors.toLowerCase();
    const title = req.params.title;

  const book = Object.values(books).filter(b => b.author.toLowerCase() === author);

  if (book.length === 0) 
  {
    return res.status(404).json({ message: 'No books found for that author' });
  }
  res.status(200).json(book);
});

// Get book details based on author using promise callback
const getByAuthor = (author) => new Promise((resolve, reject) => {
    const a = (author || '').trim().toLowerCase();
    const matches = Object.values(books).filter(
      b => (b.author || '').toLowerCase() === a
    );
    return matches.length ? resolve(matches) : reject(new Error('not found'));
  });
  
  public_users.get('/promise/author/:author', (req, res) => {
    getByAuthor(req.params.author)
      .then(list => res.json(list))
      .catch(() => res.status(404).json({ message: 'No books found for that author' }));
  });
  





// Get all books based on title using promise callback
public_users.get('/title/:title',function (req, res) {
 
const title = req.params.title.trim().toLowerCase();


const book  = Object.values(books).filter(b=> b.title.toLowerCase() ===title);


if(book.length === 0){
    return res.status(404).json({ message: 'No books found for that title' });

}

return res.status(200).json(book);


});

// Get all books based on title using promise callback
const getByTitle = (title) => new Promise((resolve, reject) => {
    const t = (title || '').trim().toLowerCase();
    const matches = Object.values(books).filter(
      b => (b.title || '').toLowerCase() === t
    );
    return matches.length ? resolve(matches) : reject(new Error('not found'));
  });
  
  public_users.get('/promise/title/:title', (req, res) => {
    getByTitle(req.params.title)
      .then(list => res.json(list))
      .catch(() => res.status(404).json({ message: 'No books found for that title' }));
  });
  





//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn.trim();
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  
  const reviews = book.reviews || {};               
  if (Object.keys(reviews).length === 0) 
  {

    return res.status(200).json({ message: 'No reviews yet', reviews: {} });
  }

  return res.json(reviews);  
  
});

module.exports.general = public_users;
