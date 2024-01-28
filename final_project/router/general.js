const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  // Extract user information from the request body
  const { username, password } = req.body;

  // Check if the username is already taken
  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ message: "Username is already taken" });
  }

  // Create a new user object and add it to the array
  const newUser = {
    username,
    password,
  };

  users.push(newUser);

  return res
    .status(200)
    .json({ message: "User registered successfully", user: newUser });
});

public_users.get("/", function (req, res) {
  const bookList = Object.values(books);
  return res.status(200).json({ books: bookList });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const { isbn } = req.params;

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json({ book });
});

public_users.get("/author/:author", function (req, res) {
  const { author } = req.params;

  // Filter books based on the specified author
  const booksByAuthor = Object.values(books).filter(
    (book) => book.author === author
  );

  if (booksByAuthor.length === 0) {
    return res
      .status(404)
      .json({ message: "No books found for the specified author" });
  }

  // Return the book details as JSON
  return res.status(200).json({ books: booksByAuthor });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  // Extract title parameter from the request
  const { title } = req.params;

  // Filter books based on the specified title
  const booksByTitle = Object.values(books).filter((book) =>
    book.title.toLowerCase().includes(title.toLowerCase())
  );

  if (booksByTitle.length === 0) {
    return res
      .status(404)
      .json({ message: "No books found for the specified title" });
  }

  return res.status(200).json({ books: booksByTitle });
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json({ reviews: book.reviews });
});

module.exports.general = public_users;
