require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const bookRoutes = require("./routes/bookRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("BookNook Server is Running!");
});

// Book Routes
app.use("/api/books", bookRoutes);

// Borrow Routes
app.use("/api/borrows", borrowRoutes);

// Auth Routes
app.use("/api/auth", authRoutes);

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`BookNook Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server Error:", error);
    process.exit(1);
  }
};

startServer();
