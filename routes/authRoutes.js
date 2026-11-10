const express = require("express");
const router = express.Router();

const { createToken } = require("../controllers/authController");

// Generate JWT
router.post("/token", createToken);

module.exports = router;
