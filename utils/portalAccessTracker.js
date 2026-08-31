const PortalView = require("../models/PortalView");
const PortalSessionLog = require("../models/PortalSessionLog");

// Helper to get formatted date string "YYYY-MM-DD"
const getDateString = (dateObj = new Date()) => {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to get previous date
const getPastDate = (daysAgo = 1) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
};

// Compute analytics metrics from MongoDB
const computeAnalytics = async () => {
  const todayStr = getDateString();
  const yesterdayStr = getDateString(getPastDate(1));

  // 1. Total views (Sum of all daily records in MongoDB)
  const totalAgg = await PortalView.aggregate([
    { $group: { _id: null, total: { $sum: "$count" } } },
  ]);
  const totalViews = totalAgg.length > 0 ? totalAgg[0].total : 0;

  // 2. Today's views in MongoDB
  const todayDoc = await PortalView.findOne({ date: todayStr });
  const todayViews = todayDoc ? todayDoc.count : 0;

  // 3. Yesterday's views & daily growth
  const yesterdayDoc = await PortalView.findOne({ date: yesterdayStr });
  const yesterdayViews = yesterdayDoc ? yesterdayDoc.count : 0;

  let dailyGrowth = 0;
  if (yesterdayViews > 0) {
    dailyGrowth = Math.round(((todayViews - yesterdayViews) / yesterdayViews) * 100);
  } else if (todayViews > 0) {
    dailyGrowth = 100;
  }

  // 4. Past 30 days vs prior 30 days for total growth
  const thirtyDaysAgoStr = getDateString(getPastDate(30));
  const sixtyDaysAgoStr = getDateString(getPastDate(60));

  const current30dDocs = await PortalView.find({
    date: { $gte: thirtyDaysAgoStr },
  });
  const current30dTotal = current30dDocs.reduce((sum, item) => sum + (item.count || 0), 0);

  const prev30dDocs = await PortalView.find({
    date: { $gte: sixtyDaysAgoStr, $lt: thirtyDaysAgoStr },
  });
  const prev30dTotal = prev30dDocs.reduce((sum, item) => sum + (item.count || 0), 0);

  let totalGrowth = 0;
  if (prev30dTotal > 0) {
    totalGrowth = Math.round(((current30dTotal - prev30dTotal) / prev30dTotal) * 100);
  } else if (current30dTotal > 0) {
    totalGrowth = 100;
  }

  // 5. Recent daily history for sparkline (last 10 records)
  const recentDocs = await PortalView.find()
    .sort({ date: -1 })
    .limit(10);

  const sortedChronological = recentDocs.reverse();
  let dailySpark = sortedChronological.map((d) => d.count);
  if (dailySpark.length === 0) {
    dailySpark = [0, 0, 0, 0, 0];
  } else if (dailySpark.length === 1) {
    dailySpark = [0, dailySpark[0]];
  }

  // Cumulative total sparkline
  let runningSum = totalViews - current30dTotal;
  if (runningSum < 0) runningSum = 0;
  let totalSpark = sortedChronological.map((d) => {
    runningSum += d.count;
    return runningSum;
  });
  if (totalSpark.length === 0) {
    totalSpark = [0, 0, 0, 0, 0];
  } else if (totalSpark.length === 1) {
    totalSpark = [0, totalSpark[0]];
  }

  return {
    totalViews,
    todayViews,
    dailyGrowth,
    totalGrowth,
    dailySpark,
    totalSpark,
  };
};

/**
 * Records an access session (guest visit or user login) with deduplication in MongoDB.
 * Refreshes, re-renders, and SPA navigation from the same session are never counted twice.
 */
const recordAccessSession = async ({
  sessionId,
  type = "VISIT",
  userId = null,
  ip = "",
  userAgent = "",
}) => {
  try {
    if (!sessionId) {
      return { success: false, isNewVisit: false };
    }

    const todayStr = getDateString();

    // 1. Fast check if this session identifier already exists in MongoDB
    const existing = await PortalSessionLog.findOne({ sessionId });
    if (existing) {
      // Duplicate access/refresh within active session -> maintain timestamp only
      await PortalSessionLog.updateOne(
        { _id: existing._id },
        { $set: { lastActiveAt: new Date() } }
      );
      const stats = await computeAnalytics();
      return { success: true, isNewVisit: false, ...stats };
    }

    // 2. New unique access/login -> attempt creation in MongoDB with unique constraint
    try {
      await PortalSessionLog.create({
        sessionId,
        ip,
        userAgent,
        date: todayStr,
        type,
        userId,
        firstSeenAt: new Date(),
        lastActiveAt: new Date(),
      });

      // Atomically increment today's count in MongoDB exactly once
      await PortalView.findOneAndUpdate(
        { date: todayStr },
        {
          $inc: { count: 1 },
          $set: { lastVisitAt: new Date() },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const stats = await computeAnalytics();
      return { success: true, isNewVisit: true, ...stats };
    } catch (insertErr) {
      if (insertErr.code === 11000) {
        // Race condition duplicate insert caught by MongoDB unique index
        const stats = await computeAnalytics();
        return { success: true, isNewVisit: false, ...stats };
      }
      throw insertErr;
    }
  } catch (error) {
    console.error("Error in recordAccessSession:", error);
    const stats = await computeAnalytics();
    return { success: false, isNewVisit: false, error: error.message, ...stats };
  }
};

module.exports = {
  recordAccessSession,
  computeAnalytics,
  getDateString,
};
