const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getSignedResumeUrl = (publicId) => {
  return cloudinary.utils.private_download_url(
    publicId,
    "pdf",
    {
      resource_type: "raw",
      expires_at: Math.floor(Date.now() / 1000) + 300, // 5 minutes
    }
  );
};

module.exports = { getSignedResumeUrl };
