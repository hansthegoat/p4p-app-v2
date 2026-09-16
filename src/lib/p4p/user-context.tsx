import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { useP4P } from './store';
import type { Employee } from './types';

// Hardcode your admin email here – change to your actual login email
const ADMIN_EMAIL = 'iddoadugyamfi123@gmail.com'; // 👈 CHANGE THIS TO YOUR LOGIN EMAIL

interface UserContextType {
  user: any | null;
  employee: Employee | null;
  role: 'employee' | 'hr' | 'admin' | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  employee: null,
  role: null,
  loading: true,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { employees } = useP4P();
  const [user, setUser] = useState<any | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const u = await getCurrentUser();
        setUser(u);
        if (u) {
          const emp = employees.find(e => e.email === u.email);
          setEmployee(emp || null);
        }
      } catch (e) {
        console.error('Error fetching user:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const emp = employees.find(e => e.email === session.user.email);
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

  // Force admin role if logged-in email matches ADMIN_EMAIL
  const role = user?.email === ADMIN_EMAIL
    ? 'admin'
    : employee?.role || null;

  return (
    <UserContext.Provider value={{ user, employee, role, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
// In src/lib/p4p/user-context.tsx
interface UserContextValue {
  user: any | null;
  role: string | null;
  logout?: () => void;
  // ... other fields
}