const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

// Borrow a Book
const borrowBook = async (req, res) => {
  try {
    const db = getDB();
    const { bookId, returnDate } = req.body;

    if (!bookId || !ObjectId.isValid(bookId)) {
      return res.status(400).json({
        message: "Valid book ID is required.",
      });
    }

    const userId = req.user.id;

    // Check if book exists
    const book = await db.collection("books").findOne({
      _id: new ObjectId(bookId),
    });

    if (!book) {
      return res.status(404).json({
        message: "Book not found.",
      });
    }

    // Check available copies
    const availableCopies = Number(book.availableCopies ?? 0);

    if (availableCopies <= 0) {
      return res.status(400).json({
        message: "No copies available.",
      });
    }

    // Prevent duplicate active borrow
    const existingBorrow = await db.collection("borrows").findOne({
      bookId: new ObjectId(bookId),
      userId,
      status: "Borrowed",
    });

    if (existingBorrow) {
      return res.status(409).json({
        message: "You have already borrowed this book.",
      });
    }

    // Decrease available copies safely
    const updateResult = await db.collection("books").updateOne(
      {
        _id: new ObjectId(bookId),
        availableCopies: { $gt: 0 },
      },
      {
        $inc: { availableCopies: -1 },
      },
    );

    if (updateResult.modifiedCount !== 1) {
      return res.status(400).json({
        message: "No copies available.",
      });
    }

    const borrow = {
      bookId: new ObjectId(bookId),
      bookTitle: book.title,
      author: book.author,
      userId,
      userName: req.user.name,
      userEmail: req.user.email,
      borrowedAt: new Date(),
      returnDate: returnDate ? new Date(returnDate) : null,
      status: "Borrowed",
    };

    const result = await db.collection("borrows").insertOne(borrow);

    res.status(201).json({
      message: "Book borrowed successfully!",
      borrowId: result.insertedId,
      borrow,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to borrow book.",
      error: error.message,
    });
  }
};

// Get My Active Borrowed Books
const getMyBorrows = async (req, res) => {
  try {
    const db = getDB();

    const borrows = await db
      .collection("borrows")
      .find({
        userId: req.user.id,
        status: "Borrowed",
      })
      .sort({ borrowedAt: -1 })
      .toArray();

    res.status(200).json({
      totalBorrows: borrows.length,
      borrows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch borrowed books.",
      error: error.message,
    });
  }
};

// Return a Book
const returnBook = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid borrow ID.",
      });
    }

    const borrow = await db.collection("borrows").findOne({
      _id: new ObjectId(id),
      userId: req.user.id,
      status: "Borrowed",
    });

    if (!borrow) {
      return res.status(404).json({
        message: "Active borrowed book not found.",
      });
    }

    const result = await db.collection("borrows").updateOne(
      {
        _id: new ObjectId(id),
        userId: req.user.id,
        status: "Borrowed",
      },
      {
        $set: {
          status: "Returned",
          returnedAt: new Date(),
        },
      },
    );

    if (result.modifiedCount !== 1) {
      return res.status(409).json({
        message: "Book already returned.",
      });
    }

    // Increase available copies
    await db.collection("books").updateOne(
      {
        _id: borrow.bookId,
      },
      {
        $inc: { availableCopies: 1 },
      },
    );

    res.status(200).json({
      message: "Book returned successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to return book.",
      error: error.message,
    });
  }
};

module.exports = {
  borrowBook,
  getMyBorrows,
  returnBook,
};
