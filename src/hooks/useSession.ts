import { useState, useEffect } from 'react';
import { WorkRegime, LeaveType } from '../index';
import type { User } from '../index';

interface Session {
  user: User | null;
  isLoggedIn: boolean;
}

export const useSession = () => {
  const [session, setSession] = useState<Session>({ user: null, isLoggedIn: false });

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        try {
          const res = await fetch("/api/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: storedToken }),
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem("authToken", data.token);
            const decoded = JSON.parse(atob(data.token.split('.')[1]));
            const mockUser: User = {
              id: decoded.id,
              name: decoded.name,
              email: decoded.email,
              role: decoded.role,
              registration: decoded.registration,
              campus: decoded.campus,
              regime: WorkRegime.DE,
              leaveType: LeaveType.Nenhum,
              hasReducedWorkload: false,
              cargaHoraria: 20,
              disciplinasMinistradas: [],
              areaAtuacao: 'Docência'
            };
            setSession({ user: mockUser, isLoggedIn: true });
          } else {
            localStorage.removeItem("authToken");
          }
        } catch (err) {
          localStorage.removeItem("authToken");
        }
      }
    };
    checkToken();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao fazer login");
    localStorage.setItem("authToken", data.token);
    setSession({ user: data.user, isLoggedIn: true });
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setSession({ user: null, isLoggedIn: false });
  };

  return { session, setSession, login, logout };
};
