const CHECKIN_LOG_KEY = "f3provas_answer_checks";
const CHECKIN_SHOWN_KEY = "f3provas_checkin_last_shown";
const DAY_MS = 24 * 60 * 60 * 1000;
const CHECKIN_THRESHOLD = 10;

export const MENTORIAS_URL = "https://f3-exatas.vercel.app/mentorias/index.html";

/** Logs an answer check and returns true if the daily check-in prompt should be shown. */
export function recordAnswerCheckAndMaybePrompt(): boolean {
  if (typeof window === "undefined") return false;

  const now = Date.now();
  let log: number[] = [];
  try {
    log = JSON.parse(localStorage.getItem(CHECKIN_LOG_KEY) ?? "[]");
  } catch {
    log = [];
  }
  log = log.filter((t) => now - t < DAY_MS);
  log.push(now);
  localStorage.setItem(CHECKIN_LOG_KEY, JSON.stringify(log));

  if (log.length < CHECKIN_THRESHOLD) return false;

  const lastShown = Number(localStorage.getItem(CHECKIN_SHOWN_KEY) ?? 0);
  if (now - lastShown < DAY_MS) return false;

  localStorage.setItem(CHECKIN_SHOWN_KEY, String(now));
  return true;
}
