import { supabase, getCurrentUser } from "@/lib/supabase";
import type { Employee, GradePoint, Globals, MonthlyPerformance } from "./types";

// ===== SAVE FUNCTIONS =====

export async function saveEmployeesToCloud(employees: Employee[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not logged in");

  for (const emp of employees) {
    const { error } = await supabase
      .from('employees')
      .upsert({
        user_id: user.id,
        id: emp.id,
        data: emp,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) throw error;
  }
}

export async function saveSettingsToCloud(globals: Globals, grades: GradePoint[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not logged in");

  const { error } = await supabase
    .from('settings')
    .upsert({
      user_id: user.id,
      globals: globals,
      grades: grades,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) throw error;
}

export async function saveMonthlyToCloud(monthlyData: MonthlyPerformance[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not logged in");

  for (const data of monthlyData) {
    const { error } = await supabase
      .from('monthly_data')
      .upsert({
        user_id: user.id,
        employee_id: data.employeeId,
        year: data.year,
        month: data.month,
        data: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, employee_id, year, month' });

    if (error) throw error;
  }
}

// ===== LOAD FUNCTIONS =====

export async function loadEmployeesFromCloud(): Promise<Employee[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('employees')
    .select('data')
    .eq('user_id', user.id);

  if (error) throw error;
  return data.map(row => row.data as Employee);
}

export async function loadSettingsFromCloud(): Promise<{ globals: Globals; grades: GradePoint[] } | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('settings')
    .select('globals, grades')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { globals: data.globals, grades: data.grades };
}

export async function loadMonthlyFromCloud(): Promise<MonthlyPerformance[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('monthly_data')
    .select('data')
    .eq('user_id', user.id);

  if (error) throw error;
  return data.map(row => row.data as MonthlyPerformance);
}

// ===== SYNC ALL =====

export async function syncAllToCloud(
  employees: Employee[],
  globals: Globals,
  grades: GradePoint[],
  monthlyData: MonthlyPerformance[]
) {
  await saveEmployeesToCloud(employees);
  await saveSettingsToCloud(globals, grades);
  await saveMonthlyToCloud(monthlyData);
}

export async function loadAllFromCloud() {
  const [employees, settings, monthlyData] = await Promise.all([
    loadEmployeesFromCloud(),
    loadSettingsFromCloud(),
    loadMonthlyFromCloud()
  ]);

  return { employees, settings, monthlyData };
}