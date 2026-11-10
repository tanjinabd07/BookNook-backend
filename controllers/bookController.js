const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

// Book data validate kore (Add ar Update duita-r jonno)
const validateBookData = (body) => {
  const { title, author, category, price, totalCopies, description, image } =
    body;

  // Validate required fields
  if (
    !title ||
    !author ||
    !category ||
    price === undefined ||
    totalCopies === undefined ||
    !description ||
    !image
  ) {
    return { error: "Please provide all required fields!" };
  }

  // Validate text fields
  if (
    typeof title !== "string" ||
    typeof author !== "string" ||
    typeof category !== "string" ||
    typeof description !== "string" ||
    typeof image !== "string" ||
    !title.trim() ||
    !author.trim() ||
    !category.trim() ||
    !description.trim() ||
    !image.trim()
  ) {
    return { error: "Please provide valid book information!" };
  }

  // Validate image URL
  let imageUrl;

  try {
    imageUrl = new URL(image.trim());

    if (!["http:", "https:"].includes(imageUrl.protocol)) {
      throw new Error("Invalid image URL");
    }
  } catch {
    return { error: "Please provide a valid image URL!" };
  }

  // Validate price
  const bookPrice = Number(price);

  if (!Number.isFinite(bookPrice) || bookPrice < 0) {
    return { error: "Price must be a valid non-negative number!" };
  }

  // Validate total copies
  const copies = Number(totalCopies);

  if (!Number.isInteger(copies) || copies < 1) {
    return { error: "Total copies must be at least 1!" };
  }

  return {
    data: {
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      price: bookPrice,
      totalCopies: copies,
      description: description.trim(),
      image: imageUrl.toString(),
    },
  };
};

// Add Book
const addBook = async (req, res) => {
  try {
    const db = getDB();

    const { error, data } = validateBookData(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    // Book information
    const book = {
      ...data,
      availableCopies: data.totalCopies,
      available: true,

      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,

      createdAt: new Date(),
    };

    const result = await db.collection("books").insertOne(book);

    res.status(201).json({
      message: "Book added successfully!",
      bookId: result.insertedId,
      book,
    });
  } catch (error) {
    console.error("Add Book Error:", error);

    res.status(500).json({
      message: "Failed to add book",
      error: error.message,
    });
  }
};

// Get All Books (Public)
const getAllBooks = async (req, res) => {
  try {
    const db = getDB();

    const books = await db
      .collection("books")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      message: "Books fetched successfully!",
      totalBooks: books.length,
      books,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch books",
      error: error.message,
    });
  }
};

// Get My Books (Logged-in user only)
const getMyBooks = async (req, res) => {
  try {
    const db = getDB();

    const books = await db
      .collection("books")
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      message: "Your books fetched successfully!",
      totalBooks: books.length,
      books,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your books",
      error: error.message,
    });
  }
};

// Get Single Book by ID
const getBookById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Book ID!",
      });
    }

    const book = await db.collection("books").findOne({
      _id: new ObjectId(id),
    });

    if (!book) {
      return res.status(404).json({
        message: "Book not found!",
      });
    }

    res.status(200).json({
      message: "Book fetched successfully!",
      book,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch book",
      error: error.message,
    });
  }
};

// Update Book (Only owner)
const updateBook = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Book ID!",
      });
    }

    const book = await db.collection("books").findOne({
      _id: new ObjectId(id),
    });

    if (!book) {
      return res.status(404).json({
        message: "Book not found!",
      });
    }

    // Shudhu je book add koreche se-i edit korte parbe
    if (book.userId !== req.user.id) {
      return res.status(403).json({
        message: "You can only edit your own books!",
      });
    }

    const { error, data } = validateBookData(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    // Koyta copy borrow kora ache
    const borrowedCount = (book.totalCopies || 0) - (book.availableCopies || 0);

    if (data.totalCopies < borrowedCount) {
      return res.status(400).json({
        message: `Total copies cannot be less than currently borrowed copies (${borrowedCount})!`,
      });
    }

    const availableCopies = data.totalCopies - borrowedCount;

    const updatedFields = {
      ...data,
      availableCopies,
      available: availableCopies > 0,
      updatedAt: new Date(),
    };

    await db
      .collection("books")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedFields });

    res.status(200).json({
      message: "Book updated successfully!",
      book: { ...book, ...updatedFields },
    });
  } catch (error) {
    console.error("Update Book Error:", error);

    res.status(500).json({
      message: "Failed to update book",
      error: error.message,
    });
  }
};

// Delete Book (Only owner)
const deleteBook = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Book ID!",
      });
    }

    const book = await db.collection("books").findOne({
      _id: new ObjectId(id),
    });

    if (!book) {
      return res.status(404).json({
        message: "Book not found!",
      });
    }

    // Shudhu je book add koreche se-i delete korte parbe
    if (book.userId !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own books!",
      });
    }

    // Kono copy borrow kora thakle delete kora jabe na
    if ((book.availableCopies || 0) < (book.totalCopies || 0)) {
      return res.status(400).json({
        message: "This book cannot be deleted while copies are borrowed!",
      });
    }

    await db.collection("books").deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({
      message: "Book deleted successfully!",
    });
  } catch (error) {
    console.error("Delete Book Error:", error);

    res.status(500).json({
      message: "Failed to delete book",
      error: error.message,
    });
  }
};

module.exports = {
  addBook,
  getAllBooks,
  getMyBooks,
  getBookById,
  updateBook,
  deleteBook,
};
