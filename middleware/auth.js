const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  let token = req.cookies.token;

  // Fallback to Authorization header if cookie is missing
  if (!token && req.headers.authorization) {
    if (req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
  }

  if (!token) {
    console.warn(`[Auth] No token for: ${req.method} ${req.originalUrl}`);
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(`[Auth] JWT Error for: ${req.originalUrl} - ${err.message}`);
    return res.status(401).json({ message: "Token is not valid" });
  }
};



module.exports = verifyToken;