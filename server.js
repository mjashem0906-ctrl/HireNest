require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectionDB');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require('path');
// const passport = require("./config/passport");
// const bulkImport = require("./utils/bulkImport");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_URL, // http://localhost:5173
  credentials: true
}));

// app.use(
//   session({
//     secret: process.env.SECRET_KEY,
//     resave: false,
//     saveUninitialized: false
//   })
// );

// Passport
// app.use(passport.initialize());
// app.use(passport.session());

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/auth", require("./routes/login")); // Your existing login (same /auth is fine)
// app.use("/api/auth", require("./routes/authRoutes")) // 🆕 Google OAuth routes
app.use("/api/candidate", require("./routes/candidate")); // Add this line

app.use("/member", require("./routes/member"));
app.use("/memberComments", require("./routes/memberComments"));
app.use("/project", require("./routes/project"));
app.use("/task", require("./routes/task"));
app.use("/subTask", require("./routes/subTask"));
app.use("/assignFor", require("./routes/assignFor"));
app.use("/request", require("./routes/statusChangeRequest"));
app.use("/dropdown", require("./routes/dropdown"));
app.use("/activityList", require("./routes/activity"));
app.use("/place", require("./routes/places"));
app.use("/service", require("./routes/service"));
// Add this near your other app.use() lines
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, async() => {
  console.log(`✅ Server running on port ${PORT}`);
});