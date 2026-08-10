import { createContext, useContext, useState, type ReactNode } from "react";

export interface Usuario { login: string; senha: string; nome: string; papel: string; }

export const USUARIOS: Usuario[] = [
  { login: "admin", senha: "locago", nome: "Rafael M.", papel: "administrador" },
  { login: "balcao", senha: "locago", nome: "Juliana S.", papel: "atendente de balcão" },
];

const KEY = "locago:auth:v1";

interface AuthApi {
  user: Usuario | null;
  login: (login: string, senha: string) => { ok: boolean; erro?: string };
  logout: () => void;
}

const AuthCtx = createContext<AuthApi | null>(null);

function load(): Usuario | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(load);

  const api: AuthApi = {
    user,
    login: (login, senha) => {
      const found = USUARIOS.find((u) => u.login === login.trim().toLowerCase() && u.senha === senha);
      if (!found) return { ok: false, erro: "Usuário ou senha inválidos." };
      const safe = { ...found, senha: "" };
      localStorage.setItem(KEY, JSON.stringify(safe));
      setUser(safe);
      return { ok: true };
    },
    logout: () => {
      localStorage.removeItem(KEY);
      setUser(null);
    },
  };

  return <AuthCtx.Provider value={api}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth precisa do AuthProvider");
  return ctx;
}
