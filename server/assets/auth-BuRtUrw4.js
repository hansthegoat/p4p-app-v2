import { s as supabase } from "./router-B8uhSUT7.js";
async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}
async function register(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  if (error) throw error;
  return data;
}
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
export {
  logout as a,
  login as l,
  register as r
};
