import { User } from '../types';

// Simulate backend URL from env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const AUTH_KEY = 'taskflow_auth_user';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  const user: User = await response.json();
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
};

export const signup = async (email: string, password: string, name: string): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Signup failed');
  }

  const user: User = await response.json();
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
};

export const logout = async (): Promise<void> => {
  await delay(200);
  localStorage.removeItem(AUTH_KEY);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
};
