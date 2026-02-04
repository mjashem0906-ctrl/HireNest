// const router = require("express").Router();
// const passport = require("passport");
// const jwt = require("jsonwebtoken");

// router.get("/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get("/google/callback",
//   passport.authenticate("google", { session: false }),
//   (req, res) => {

//     const token = jwt.sign(
//       { id: req.user._id },
//       process.env.SECRET_KEY,
//       { expiresIn: "7d" }
//     );

//     res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
//   }
// );

// module.exports = router;
const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

// URL: http://localhost:5000/api/auth/google
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// URL: http://localhost:5000/api/auth/google/callback
router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // Generate JWT token for the user with correct fields
    const token = jwt.sign(
      {
        userId: req.user._id,
        role: req.user.role,
        memberId: req.user.memberId
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    // Set cookie with explicit Path=/ for global availability
    const cookieOptions = {
      httpOnly: true,
      path: '/',
      sameSite: 'Lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);

    // Redirect immediately
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);


  }
);




module.exports = router;