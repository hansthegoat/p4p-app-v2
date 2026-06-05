import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_GLOBALS, DEFAULT_GRADES, DEMO_EMPLOYEES } from "./defaults";
import { calculate } from "./calc";
import type { Employee, GradePoint, Globals, CalcResult } from "./types";

const LS_KEY = "p4p_state_v1";

interface State {
  globals: Globals;
  grades: GradePoint[];
  employees: Employee[];
}

interface Ctx extends State {
  setGlobals: (g: Partial<Globals>) => void;
  setGrades: (g: GradePoint[]) => void;
  resetGrades: () => void;
  upsertEmployee: (e: Employee) => void;
  removeEmployee: (id: string) => void;
  clearEmployees: () => void;
  loadDemo: () => void;
  setEmployees: (list: Employee[]) => void;
  calc: CalcResult;
}

const C = createContext<Ctx | null>(null);

function loadInitial(): State {
  if (typeof window === "undefined") {
    return { globals: DEFAULT_GLOBALS, grades: DEFAULT_GRADES, employees: DEMO_EMPLOYEES };
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        globals: { ...DEFAULT_GLOBALS, ...parsed.globals },
        grades: parsed.grades?.length ? parsed.grades : DEFAULT_GRADES,
        employees: Array.isArray(parsed.employees) ? parsed.employees : DEMO_EMPLOYEES,
      };
    }
  } catch {}
  return { globals: DEFAULT_GLOBALS, grades: DEFAULT_GRADES, employees: DEMO_EMPLOYEES };
}

export function P4PProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => loadInitial());

  // hydrate from localStorage on client (in case SSR returned defaults)
  useEffect(() => {
    setState(loadInitial());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const setGlobals = useCallback((g: Partial<Globals>) =>
    setState((s) => ({ ...s, globals: { ...s.globals, ...g } })), []);
  const setGrades = useCallback((grades: GradePoint[]) =>
    setState((s) => ({ ...s, grades })), []);
  const resetGrades = useCallback(() =>
    setState((s) => ({ ...s, grades: DEFAULT_GRADES })), []);
  const upsertEmployee = useCallback((e: Employee) =>
    setState((s) => {
      const exists = s.employees.some((x) => x.id === e.id);
      return { ...s, employees: exists ? s.employees.map((x) => x.id === e.id ? e : x) : [...s.employees, e] };
    }), []);
  const removeEmployee = useCallback((id: string) =>
    setState((s) => ({ ...s, employees: s.employees.filter((x) => x.id !== id) })), []);
  const clearEmployees = useCallback(() =>
    setState((s) => ({ ...s, employees: [] })), []);
  const loadDemo = useCallback(() =>
    setState({ globals: DEFAULT_GLOBALS, grades: DEFAULT_GRADES, employees: DEMO_EMPLOYEES }), []);
  const setEmployees = useCallback((list: Employee[]) =>
    setState((s) => ({ ...s, employees: list })), []);

  const calc = useMemo(() => calculate(state.employees, state.grades, state.globals), [state]);

  const value: Ctx = {
    ...state, setGlobals, setGrades, resetGrades, upsertEmployee,
    removeEmployee, clearEmployees, loadDemo, setEmployees, calc,
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useP4P() {
  const v = useContext(C);
  if (!v) throw new Error("useP4P must be used inside P4PProvider");
  return v;
}
