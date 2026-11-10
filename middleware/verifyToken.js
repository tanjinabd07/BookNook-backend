// const verifyToken = async (req, res, next) => {
//   try {
//     const cookie = req.headers.cookie;

//     if (!cookie) {
//       return res.status(401).json({
//         message: "Unauthorized! Please login first.",
//       });
//     }

//     // Better Auth session verify
//     const response = await fetch(
//       `${process.env.CLIENT_URL || "http://localhost:3000"}/api/auth/get-session`,
//       {
//         method: "GET",
//         headers: {
//           cookie,
//         },
//       },
//     );

//     if (!response.ok) {
//       return res.status(401).json({
//         message: "Invalid or expired session. Please login again.",
//       });
//     }

//     const sessionData = await response.json();

//     if (!sessionData || !sessionData.user) {
//       return res.status(401).json({
//         message: "User session not found. Please login first.",
//       });
//     }

//     // Logged-in user information
//     req.user = {
//       id: sessionData.user.id,
//       name: sessionData.user.name,
//       email: sessionData.user.email,
//     };

//     next();
//   } catch (error) {
//     console.error("Authentication Error:", error);

//     return res.status(500).json({
//       message: "Authentication verification failed.",
//     });
//   }
// };

// module.exports = verifyToken;

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized! JWT token is required.",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user information
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token. Please login again.",
    });
  }
};

module.exports = verifyToken;
