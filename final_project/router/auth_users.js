const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => !users.some(u => u.username.toLowerCase() === username.toLowerCase());
const authenticatedUser = (username, password) =>
  users.some(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);




//only registered users can login
// regd_users.post("/login", (req,res) => {
//     const { username, password } = req.body || {};
//   if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

//   const u = users.find(x => x.username.trim().toLowerCase() === username.trim().toLowerCase());
//   if (!u || u.password !== password) {
//     return res.status(401).json({ message: 'Invalid username or password' });
//   }

//   const accessToken = jwt.sign({ username: u.username }, 'access', { expiresIn: '1h' });
//   req.session.authorization = { username: u.username, accessToken };

//   return res.json({ message: 'Login successful', token: accessToken });
// });



regd_users.post("/login", (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: "Username and password are required" });
  
    const ok = users.some(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!ok) return res.status(401).json({ message: "Invalid username or password" });
  
    const token = jwt.sign({ username }, "access", { expiresIn: "1h" });
    req.session.auth = { username, token };   // <<< store here
  
    return res.json({ message: "Login successful", token });
  });
  

// Add a book review
// Add or modify a book review (must be logged in)
// regd_users.put("/auth/review/:isbn", (req, res) => {
//     const isbn = req.params.isbn;
//     const review = (req.query.review || "").trim();
  
//     // who is logged in?
//     const username = req.session?.authorization?.username;
//     if (!username) {
//       return res.status(401).json({ message: "Please log in first" });
//     }
  
//     // basic checks
//     const book = books[isbn];
//     if (!book) {
//       return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
//     }
//     if (!review) {
//       return res.status(400).json({ message: "review query is required, e.g. ?review=Great%20book" });
//     }
  
//     // ensure reviews object exists
//     if (!book.reviews) book.reviews = {};
  
//     // add or update this user's review
//     const isUpdate = Object.prototype.hasOwnProperty.call(book.reviews, username);
//     book.reviews[username] = review;
  
//     return res.status(200).json({
//       message: isUpdate ? "Review updated" : "Review added",
//       reviews: book.reviews
//     });
//   });
  


regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session?.auth?.username;             // <<< read same place
    if (!username) return res.status(401).json({ message: "Please Login First" });
  
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (!book) return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  
    // lab expects review in query; allow body too for convenience
    const review = (req.query.review || req.body?.review || "").trim();
    if (!review) return res.status(400).json({ message: "review is required (query or JSON body)" });
  
    if (!book.reviews) book.reviews = {};
    const isUpdate = username in book.reviews;
    book.reviews[username] = review;
  
    return res.json({ message: isUpdate ? "Review updated" : "Review added", reviews: book.reviews });
  });
  

// DELETE your review for a book
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session?.auth?.username;   // must match where you saved it on login
    if (!username) {
      return res.status(401).json({ message: "Please log in first" });
    }
  
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
  
    const reviews = book.reviews || {};
    if (!(username in reviews)) {
      return res.status(404).json({ message: "You have not reviewed this book yet" });
    }
  
    delete reviews[username];
    book.reviews = reviews;
  
    return res.status(200).json({ message: "Your review was deleted", reviews });
  });
  





module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
