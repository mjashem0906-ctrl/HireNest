<<<<<<< HEAD
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const Login = require('../models/login');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const googleId = profile.id;

      // Find user by googleId or email
      let user = await Login.findOne({
        $or: [
          { googleId: googleId },
          { username: email }
        ]
      });

      if (!user) {
        // Create new user if not found - Default role is 'Candidate'
        // This signifies a 3rd party user (Naukri/LinkedIn style)
        user = await Login.create({
          username: email,
          googleId: googleId,
          role: 'Candidate',
          profileCompleted: 0
        });
      } else if (!user.googleId) {
        // Link existing email-based user to Google ID
        user.googleId = googleId;
        await user.save();
      }

      return done(null, user);

    } catch (err) {
      console.error("Auth Error:", err);
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
=======
const { google } = require("googleapis");
const path = require("path");

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

module.exports = auth;
>>>>>>> 83d05d0a459a0ec8738316ab2b45cddae3775eb8
