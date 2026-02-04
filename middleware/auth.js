const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
<<<<<<< HEAD
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
=======
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });
>>>>>>> 83d05d0a459a0ec8738316ab2b45cddae3775eb8

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
<<<<<<< HEAD
    console.error(`[Auth] JWT Error for: ${req.originalUrl} - ${err.message}`);
    return res.status(401).json({ message: "Token is not valid" });
  }
};



=======
    return res.status(400).json({ message: "Token is not valid" });
  }
};

>>>>>>> 83d05d0a459a0ec8738316ab2b45cddae3775eb8
module.exports = verifyToken;