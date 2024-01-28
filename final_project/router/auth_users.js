const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.find((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.find(
    (user) => user.username === username && user.password === password
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  // Extract user credentials from the request body
  const { username, password } = req.body;

  // Find the user in the array
  const user = authenticatedUser(username, password);

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Create a JWT token
  const token = jwt.sign({ username: user.username }, "fingerprint_customer", {
    expiresIn: "1h",
  });

  // Set the JWT token in the session
  req.session.token = token;
  req.session.username = username;

  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { username } = req.session;
  const { review } = req.body;

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  book.reviews[username] = review;
  return res.status(200).json({ message: "Review added successfully", book });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { username } = req.session;

  // Find the book with the specified ISBN
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has a review for the book
  if (!book.reviews[username]) {
    return res.status(404).json({ message: "Review not found for the current user" });
  }

  // Delete the review for the current user
  delete book.reviews[username];

  return res.status(200).json({ message: "Review deleted successfully", book });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
