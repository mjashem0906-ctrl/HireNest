const { recordAccessSession, computeAnalytics } = require("../utils/portalAccessTracker");
const crypto = require("crypto");

/**
 * Record a portal view / visit with strict deduplication in MongoDB
 */
exports.recordVisit = async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";

    let sessionId = req.body?.sessionId || req.headers["x-session-id"];
    if (!sessionId) {
      sessionId = crypto
        .createHash("sha256")
        .update(`${ip}-${userAgent}`)
        .digest("hex");
    }

    const result = await recordAccessSession({
      sessionId,
      type: "VISIT",
      ip,
      userAgent,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error recording portal visit:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record portal visit",
      error: error.message,
    });
  }
};

/**
 * Fetch current portal view stats without incrementing
 */
exports.getViewStats = async (req, res) => {
  try {
    const stats = await computeAnalytics();

    return res.status(200).json({
      success: true,
      ...stats,
    });
  } catch (error) {
    console.error("Error fetching portal view stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch portal view stats",
      error: error.message,
    });
  }
};
