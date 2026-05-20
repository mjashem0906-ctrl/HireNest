const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ── Allowed MIME types ─────────────────────────────────────────────────────────
const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DOC_MIMES   = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// ── Ensure subdirectories exist ────────────────────────────────────────────────
const BASE_DIR    = path.join(__dirname, "..", "uploads");
const PHOTOS_DIR  = path.join(BASE_DIR, "photos");
const RESUMES_DIR = path.join(BASE_DIR, "resumes");

[BASE_DIR, PHOTOS_DIR, RESUMES_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Storage: pick subfolder by MIME type ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = IMAGE_MIMES.includes(file.mimetype) ? PHOTOS_DIR : RESUMES_DIR;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    cb(null, `${uniqueSuffix}-${safeName}${ext}`);
  },
});

// ── File filter ────────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if ([...IMAGE_MIMES, ...DOC_MIMES].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Allowed: JPG, PNG, PDF, DOC, DOCX"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ── POST /api/upload ───────────────────────────────────────────────────────────
// Body : multipart/form-data  field: "file"
// Returns: { url, folder }   e.g. { url: "http://.../uploads/resumes/...", folder: "resumes" }
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // Auto-detect base URL from the incoming request — no env var needed.
  //   Local:      http://localhost:5000
  //   Production: https://jobbridgenode.com
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host     = req.headers["x-forwarded-host"]  || req.get("host");
  const baseUrl  = `${protocol}://${host}`;

  // Determine which subfolder was used
  const isImage  = IMAGE_MIMES.includes(req.file.mimetype);
  const subFolder = isImage ? "photos" : "resumes";

  const fileUrl = `${baseUrl}/uploads/${subFolder}/${req.file.filename}`;

  return res.status(200).json({
    success: true,
    url: fileUrl,
    folder: subFolder,   // "photos" | "resumes"
  });
});

// ── Error handler (multer errors) ──────────────────────────────────────────────
router.use((err, req, res, next) => {
  console.error("Upload error:", err.message);
  res.status(400).json({ success: false, message: err.message });
});

module.exports = router;
