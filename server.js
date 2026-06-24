//------------------------16/01-----------1.06-------

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectionDB');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require('path');
const passport = require('passport'); // Added for Google Auth

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Initialize Passport config
require('./config/googleAuth'); 

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize()); // Added for Google Auth

app.use(cors({
  origin: [
    process.env.CLIENT_URL,              // https://jobkar-1wf4.vercel.app
    "http://localhost:5173"               // keep for local dev
  ],
  credentials: true
}));


// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---
// Added the Google Auth Route to fix "Cannot GET /api/auth/google"
app.use("/api/auth", require("./routes/authRoutes")); 

app.use("/auth", require("./routes/login"));
app.use("/api/candidate", require("./routes/candidate"));
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
// Add this line to server.js
app.use("/api/recruiters", require("./routes/recruiterRoutes"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/mentor-connections", require("./routes/mentorConnection"));
app.use("/referee", require("./routes/refereeRoutes"));
app.use("/api/notifications", require("./routes/notification"));
app.use("/api/send-to-recruiter", require("./routes/sendToRecruiter"));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, async() => {
  console.log(`✅ Server running on port ${PORT}`);
  
  // Sync dropdowns with existing member data on startup
  try {
    const syncDropdowns = require("./utils/syncDropdowns");
    await syncDropdowns();
  } catch (err) {
    console.error("Failed to run syncDropdowns on startup:", err);
  }

  // Seed default notification workflows
  try {
    const seedNotificationWorkflows = require("./utils/seedNotificationWorkflows");
    await seedNotificationWorkflows();
  } catch (err) {
    console.error("Failed to run seedNotificationWorkflows on startup:", err);
  }
});