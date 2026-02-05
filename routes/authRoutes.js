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

// URL: /api/auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// URL: /api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      {
        userId: req.user._id,
        role: req.user.role,
        memberId: req.user.memberId,
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    // ✅ UPDATED: production-safe cookie options
    const cookieOptions = {
      httpOnly: true,
      path: "/",
      sameSite: "None",   // REQUIRED for Vercel ↔ backend
      secure: true,       // REQUIRED for HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);

    // ✅ DO NOT CHANGE LOGIC – env must be correct
    res.redirect(
      `${process.env.CLIENT_URL}/oauth-success?token=${token}`
    );
  }
);

module.exports = router;
