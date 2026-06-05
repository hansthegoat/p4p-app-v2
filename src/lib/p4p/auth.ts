const KEY = "p4p_logged_in";

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

export function login(username: string, password: string): boolean {
  const valid =
    (username.trim() === "Sarah Amartey Amarh" && password === "hr@aoholdings.net") ||
    (username.trim() === "" && password === "");
  if (valid && typeof window !== "undefined") localStorage.setItem(KEY, "1");
  return valid;
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
