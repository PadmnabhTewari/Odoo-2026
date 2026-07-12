import type { EmployeeRole } from '../types/assetflow';

export type StoredEmployee = {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  status: string;
  departmentId: string | null;
};

const tokenKey = 'assetflow_token';
const employeeKey = 'assetflow_employee';

export function getStoredToken() {
  return localStorage.getItem(tokenKey);
}

export function getStoredEmployee() {
  const rawEmployee = localStorage.getItem(employeeKey);
  if (!rawEmployee) {
    return null;
  }

  try {
    return JSON.parse(rawEmployee) as StoredEmployee;
  } catch {
    return null;
  }
}

export function storeSession(token: string, employee: StoredEmployee) {
  localStorage.setItem(tokenKey, token);
  localStorage.setItem(employeeKey, JSON.stringify(employee));
}

export function clearSession() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(employeeKey);
}
