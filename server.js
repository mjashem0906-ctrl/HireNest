<<<<<<< HEAD
=======
// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/connectionDB');
// const cookieParser = require("cookie-parser");
// const session = require("express-session");
// const path = require('path');
// // const passport = require("./config/passport");
// // const bulkImport = require("./utils/bulkImport");

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Connect DB
// connectDB();

// app.use(express.json());
// app.use(cookieParser());

// app.use(cors({
//   origin: process.env.CLIENT_URL, // http://localhost:5173
//   credentials: true
// }));

// // app.use(
// //   session({
// //     secret: process.env.SECRET_KEY,
// //     resave: false,
// //     saveUninitialized: false
// //   })
// // );

// // Passport
// // app.use(passport.initialize());
// // app.use(passport.session());

// // Serve uploaded files statically
// app.use("/uploads", express.static("uploads"));

// // Routes
// app.use("/auth", require("./routes/login")); // Your existing login (same /auth is fine)
// // app.use("/api/auth", require("./routes/authRoutes")) // 🆕 Google OAuth routes
// app.use("/api/candidate", require("./routes/candidate")); // Add this line

// app.use("/member", require("./routes/member"));
// app.use("/memberComments", require("./routes/memberComments"));
// app.use("/project", require("./routes/project"));
// app.use("/task", require("./routes/task"));
// app.use("/subTask", require("./routes/subTask"));
// app.use("/assignFor", require("./routes/assignFor"));
// app.use("/request", require("./routes/statusChangeRequest"));
// app.use("/dropdown", require("./routes/dropdown"));
// app.use("/activityList", require("./routes/activity"));
// app.use("/place", require("./routes/places"));
// app.use("/service", require("./routes/service"));
// // Add this near your other app.use() lines
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Health check
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'ok', timestamp: Date.now() });
// });

// app.listen(PORT, async() => {
//   console.log(`✅ Server running on port ${PORT}`);
// });
>>>>>>> 83d05d0a459a0ec8738316ab2b45cddae3775eb8
//------------------------16/01-----------1.06-------

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectionDB');
const cookieParser = require("cookie-parser");
const session = require("express-session");
<<<<<<< HEAD
const path = require('path');
const passport = require('passport'); // Added for Google Auth
=======
const path = require('path'); // ✅ Import path module
>>>>>>> 83d05d0a459a0ec8738316ab2b45cddae3775eb8

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

<<<<<<< HEAD
// Initialize Passport config
require('./config/googleAuth'); 

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize()); // Added for Google Auth
=======
app.use(express.json());
app.use(cookieParser());
>>>>>>> 83d05d0a459a0ec8738316ab2b45cddae3775eb8

app.use(cors({
  origin: process.env.CLIENT_URL, // http://localhost:5173
  credentials: true
}));

// Serve uploaded files statically
<<<<<<< HEAD
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---
// Added the Google Auth Route to fix "Cannot GET /api/auth/google"
app.use("/api/auth", require("./routes/authRoutes")); 

app.use("/auth", require("./routes/login"));
app.use("/api/candidate", require("./routes/candidate"));
=======
// ✅ This fixes the "Cannot GET /uploads/..." error
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/auth", require("./routes/login"));
app.use("/api/candidate", require("./routes/candidate"));

>>>>>>> 83d05d0a459a0ec8738316ab2b45cddae3775eb8
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
<<<<<<< HEAD
// Add this line to server.js
app.use("/api/recruiters", require("./routes/recruiterRoutes"));
=======
>>>>>>> 83d05d0a459a0ec8738316ab2b45cddae3775eb8

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, async() => {
  console.log(`✅ Server running on port ${PORT}`);
});