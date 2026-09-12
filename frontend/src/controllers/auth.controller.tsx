import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/models';
import { authService } from '@/services/auth.service';

type AuthContextValue = { user: User | null; loading: boolean; login(data: { email: string; password: string }): Promise<void>; signup(data: { name: string; email: string; password: string }): Promise<void>; logout(): Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthController({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { authService.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  return <AuthContext.Provider value={{ user, loading, login: async (data) => setUser(await authService.login(data)), signup: async (data) => setUser(await authService.signup(data)), logout: async () => { await authService.logout(); setUser(null); } }}>{children}</AuthContext.Provider>;
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be inside AuthController'); return value; }
