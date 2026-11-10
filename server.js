const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const bookRoutes = require("./routes/bookRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://192.168.0.105:3000",
    ],
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
  }
};

startServer();
