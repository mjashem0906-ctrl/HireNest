import API from "../axios";

const GUEST_SESSION_KEY = "jb_portal_session_id";

/**
 * Returns a stable session identifier for the current visit.
 * - If user is logged in, uses a token-based session ID.
 * - If guest, uses sessionStorage (survives page refreshes/reloads in the same tab).
 */
export const getActiveSessionId = () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      return `auth_${token.substring(token.length - 32)}`;
    }

    let sid = sessionStorage.getItem(GUEST_SESSION_KEY);
    if (!sid) {
      sid = "guest_sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem(GUEST_SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "guest_sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);
  }
};

let inFlightPromise = null;
let lastRecordedSessionId = null;

/**
 * Records a portal visit/access in MongoDB with strict session deduplication.
 * - Exactly +1 on brand new guest visit or new login.
 * - Exactly +0 on page refresh, component re-render, StrictMode double mount, or SPA navigation.
 */
export const recordPortalVisit = async () => {
  const sessionId = getActiveSessionId();

  // If this exact session was already dispatched during this runtime, skip
  if (lastRecordedSessionId === sessionId) {
    return null;
  }

  // If a request for this session is already in-flight, return the existing promise (prevents StrictMode double call)
  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    try {
      lastRecordedSessionId = sessionId;
      const res = await API.post("/api/portal-views/record", { sessionId });
      return res.data;
    } catch (error) {
      console.error("[Analytics] Failed to record portal access:", error);
      return null;
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
};

/**
 * Call on user logout to clear session tokens
 */
export const clearPortalSession = () => {
  try {
    sessionStorage.removeItem(GUEST_SESSION_KEY);
    lastRecordedSessionId = null;
    inFlightPromise = null;
  } catch {
    // ignore
  }
};
