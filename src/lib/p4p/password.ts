// Common weak passwords — reject these outright
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "12345678", "123456789",
  "1234567890", "qwerty", "qwerty123", "qwertyuiop", "letmein",
  "welcome", "welcome1", "admin", "admin123", "administrator",
  "iloveyou", "monkey", "dragon", "baseball", "football",
  "abc123", "abcdef", "abcd1234", "111111", "000000",
  "p@ssw0rd", "p@ssword", "passw0rd", "1q2w3e4r", "qazwsx",
  "1234qwer", "aoholdings", "p4p", "p4ppassword",
]);

export interface PasswordCheck {
  ok: boolean;
  score: number;
  label: string;
  errors: string[];
}

export function checkPassword(pw: string): PasswordCheck {
  const errors: string[] = [];
  let score = 0;

  if (pw.length < 10) {
    errors.push("At least 10 characters");
  } else {
    score++;
  }

  if (!/[a-zA-Z]/.test(pw)) {
    errors.push("Must contain at least one letter");
  } else {
    score++;
  }

  if (!/[0-9]/.test(pw)) {
    errors.push("Must contain at least one number");
  } else {
    score++;
  }

  if (COMMON_PASSWORDS.has(pw.toLowerCase())) {
    errors.push("Too common — pick something less guessable");
    score = 0;
  } else if (pw.length >= 12 && /[^a-zA-Z0-9]/.test(pw)) {
    score++;
  }

  score = Math.max(0, Math.min(4, score));

  const labels = ["Weak", "Fair", "Good", "Strong", "Strong"];
  const label = labels[score];

  return {
    ok: errors.length === 0,
    score,
    label,
    errors,
  };
}

export function passwordColor(score: number): string {
  if (score <= 1) return "bg-red-500";
  if (score === 2) return "bg-amber-500";
  if (score === 3) return "bg-blue-500";
  return "bg-emerald-500";
}
