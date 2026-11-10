const jwt = require("jsonwebtoken");

// Create JWT after verifying Better Auth session
const createToken = async (req, res) => {
  try {
    const cookie = req.headers.cookie;

    if (!cookie) {
      return res.status(401).json({
        message: "Please login first.",
      });
    }

    // Verify Better Auth session
    const response = await fetch(
      `${process.env.CLIENT_URL || "http://localhost:3000"}/api/auth/get-session`,
      {
        method: "GET",
        headers: {
          cookie,
        },
      },
    );

    if (!response.ok) {
      return res.status(401).json({
        message: "Invalid or expired session.",
      });
    }

    const sessionData = await response.json();

    if (!sessionData || !sessionData.user) {
      return res.status(401).json({
        message: "User session not found.",
      });
    }

    // Create JWT payload
    const user = {
      id: sessionData.user.id,
      name: sessionData.user.name,
      email: sessionData.user.email,
    };

    // Sign JWT
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      message: "JWT created successfully!",
      token,
      user,
    });
  } catch (error) {
    console.error("JWT Creation Error:", error);

    return res.status(500).json({
      message: "Failed to create JWT.",
    });
  }
};

module.exports = { createToken };
