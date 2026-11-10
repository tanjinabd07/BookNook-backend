const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");

const {
  borrowBook,
  getMyBorrows,
  returnBook,
} = require("../controllers/borrowController");

// POST - Borrow a Book
router.post("/", verifyToken, borrowBook);

// GET - Get My Borrowed Books
router.get("/", verifyToken, getMyBorrows);

// DELETE - Return a Borrowed Book
router.delete("/:id", verifyToken, returnBook);

module.exports = router;
