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

public_users.get("/", async function (req, res) {
  try {
    const bookList = await getBookList();
    return res.status(200).json({ books: bookList });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

public_users.get("/isbn/:isbn", async function (req, res) {
  const { isbn } = req.params;
  try {
    const result = await getBookDetailsByISBN(isbn);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
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

public_users.get("/author/:author", async function (req, res) {
  const { author } = req.params;

  try {
    const result = await getBooksByAuthor(author);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

public_users.get("/title/:title", async function (req, res) {
  const { title } = req.params;

  try {
    const result = await getBooksByTitle(title);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
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

//

const getBookList = async () => {
  return Object.values(books);
};

const getBookDetailsByISBN = async (isbn) => {
  const book = books[isbn];
  if (!book) {
    throw new Error("Book not found");
  }
  return { book };
};

const getBooksByAuthor = async (author) => {
  const booksByAuthor = Object.values(books).filter(
    (book) => book.author === author
  );

  if (booksByAuthor.length === 0) {
    throw new Error("No books found for the specified author");
  }

  return { books: booksByAuthor };
};

const getBooksByTitle = async (title) => {
  const booksByTitle = Object.values(books).filter((book) =>
    book.title.toLowerCase().includes(title.toLowerCase())
  );

  if (booksByTitle.length === 0) {
    throw new Error("No books found for the specified title");
  }

  return { books: booksByTitle };
};
