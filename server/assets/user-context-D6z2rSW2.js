import { jsx } from "react/jsx-runtime";
import { useState, useEffect, useContext, createContext } from "react";
import { s as supabase, g as getCurrentUser } from "./router-ykR6owpd.js";
import { u as useP4P } from "./store-Dy84gyCY.js";
const ADMIN_EMAIL = "dts6@aoholdings.net";
const UserContext = createContext({
  user: null,
  employee: null,
  role: null,
  loading: true
});
const UserProvider = ({ children }) => {
  const { employees } = useP4P();
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const u = await getCurrentUser();
        setUser(u);
        if (u) {
          const emp = employees.find((e) => e.email === u.email);
          setEmployee(emp || null);
        }
      } catch (e) {
        console.error("Error fetching user:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const emp = employees.find((e) => e.email === session.user.email);
        setEmployee(emp || null);
      } else {
        setUser(null);
        setEmployee(null);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [employees]);
  const role = user?.email === ADMIN_EMAIL ? "admin" : employee?.role || null;
  return /* @__PURE__ */ jsx(UserContext.Provider, { value: { user, employee, role, loading }, children });
};
const useUser = () => useContext(UserContext);
export {
  UserProvider as U,
  useUser as u
};
