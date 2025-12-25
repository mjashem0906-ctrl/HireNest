const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {

    const token = jwt.sign(
      { id: req.user._id },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  }
);

module.exports = router;
