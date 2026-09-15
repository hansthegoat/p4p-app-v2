const KEY_PREFIX = "p4p_login_attempts_";
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

interface AttemptRecord {
  attempts: number[];
  lockedUntil?: number;
}

function readRecord(email: string): AttemptRecord {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + email.toLowerCase());
    if (!raw) return { attempts: [] };
    const parsed = JSON.parse(raw);
    return {
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      lockedUntil: parsed.lockedUntil,
    };
  } catch {
    return { attempts: [] };
  }
}

function writeRecord(email: string, rec: AttemptRecord) {
  try {
    localStorage.setItem(KEY_PREFIX + email.toLowerCase(), JSON.stringify(rec));
  } catch {}
}

export function checkLockout(email: string): { locked: boolean; minutesLeft: number } {
  const rec = readRecord(email);
  if (!rec.lockedUntil) return { locked: false, minutesLeft: 0 };
  const now = Date.now();
  if (now >= rec.lockedUntil) {
    writeRecord(email, { attempts: [] });
    return { locked: false, minutesLeft: 0 };
  }
  const minutesLeft = Math.ceil((rec.lockedUntil - now) / 60000);
  return { locked: true, minutesLeft };
}

export function recordFailure(email: string): { locked: boolean; attemptsLeft: number } {
  const now = Date.now();
  const rec = readRecord(email);

  rec.attempts = rec.attempts.filter((timestamp) => now - timestamp < WINDOW_MS);
  rec.attempts.push(now);

  if (rec.attempts.length >= MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCKOUT_MS;
    rec.attempts = [];
    writeRecord(email, rec);
    return { locked: true, attemptsLeft: 0 };
  }

  writeRecord(email, rec);
  return { locked: false, attemptsLeft: MAX_ATTEMPTS - rec.attempts.length };
}

export function clearThrottle(email: string) {
  try {
    localStorage.removeItem(KEY_PREFIX + email.toLowerCase());
  } catch {}
}
