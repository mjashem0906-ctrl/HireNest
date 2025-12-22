const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectionDB');
const cookieParser = require("cookie-parser");
// const bulkImport = require("./utils/bulkImport");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// ← IMPORTANT ORDER ENDS HERE

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_URL, // http://localhost:5173
  credentials: true
}));

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/auth", require("./routes/login")); // Your existing login (same /auth is fine)
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

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, async() => {
  console.log(`✅ Server running on port ${PORT}`);
});