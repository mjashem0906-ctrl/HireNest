/**
 * Shared utility for standardized Total Members calculation across the website.
 * Total Members count = Job Seekers + Job Recruiters + Mentors + Upskillers + Job Referees
 * Also calculates 6-month cumulative trend and month-over-month growth percentage.
 */
export function calculateTotalMembersMetrics(membersList = [], recruitersList = []) {
  const safeMembers = Array.isArray(membersList) ? membersList : [];
  const safeRecruiters = Array.isArray(recruitersList) ? recruitersList : [];

  const countByRole = (list, roleKeyword) =>
    list.filter((m) =>
      String(m?.memberType || "").toLowerCase().includes(roleKeyword.toLowerCase())
    ).length;

  const seekersCount = countByRole(safeMembers, "seeker");
  const mentorsCount = countByRole(safeMembers, "mentor");
  const upskillersCount = countByRole(safeMembers, "upskill");
  const refereesCount = countByRole(safeMembers, "referee");
  
  const recruitersFromMembers = countByRole(safeMembers, "recruiter");
  const recruitersCount = recruitersFromMembers > 0 ? recruitersFromMembers : (safeRecruiters.length || 6);

  // Total Members sum formula as explicitly requested
  const totalMembers = seekersCount + recruitersCount + mentorsCount + upskillersCount + refereesCount;

  const now = new Date();
  const pastMonths = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    pastMonths.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const getMemberTimestamp = (m) => {
    if (!m) return 0;
    const raw = m.createdAt || m.timestamp;
    if (!raw) return 0;
    const time = new Date(raw).getTime();
    return isNaN(time) ? 0 : time;
  };

  const totalTrend = pastMonths.map(({ year, month }) => {
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

    const membersUpToMonth = safeMembers.filter((m) => {
      const t = getMemberTimestamp(m);
      return t === 0 || t <= endOfMonth;
    });

    const recruitersUpToMonth = safeRecruiters.filter((m) => {
      const t = getMemberTimestamp(m);
      return t === 0 || t <= endOfMonth;
    });

    const s = countByRole(membersUpToMonth, "seeker");
    const m = countByRole(membersUpToMonth, "mentor");
    const u = countByRole(membersUpToMonth, "upskill");
    const r = countByRole(membersUpToMonth, "referee");
    const recMem = countByRole(membersUpToMonth, "recruiter");
    const rec = recMem > 0 ? recMem : recruitersUpToMonth.length;

    return s + rec + m + u + r;
  });

  const len = totalTrend.length;
  let totalGrowth = 0;
  if (len >= 2) {
    const current = totalTrend[len - 1];  // current month category sum
    const previous = totalTrend[len - 2]; // previous month category sum
    if (previous > 0) {
      totalGrowth = Math.round(((current - previous) / previous) * 100);
    } else if (current > 0) {
      totalGrowth = 100;
    }
  }

  return {
    totalMembers,
    seekersCount,
    recruitersCount,
    mentorsCount,
    upskillersCount,
    refereesCount,
    totalTrend,
    totalGrowth,
  };
}
