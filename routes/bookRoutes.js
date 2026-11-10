const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");

const {
  addBook,
  getAllBooks,
  getMyBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

// Add Book (Login required)
router.post("/add", verifyToken, addBook);

// Get All Books (Public)
router.get("/", getAllBooks);

// Get My Books (Login required)
router.get("/my-books", verifyToken, getMyBooks);

// Get Single Book by ID (Public)
router.get("/:id", getBookById);

// Update Book (Login required) - PUT ar PATCH duita-i cholbe
router.put("/:id", verifyToken, updateBook);
router.patch("/:id", verifyToken, updateBook);

// Delete Book (Login required)
router.delete("/:id", verifyToken, deleteBook);

module.exports = router;
