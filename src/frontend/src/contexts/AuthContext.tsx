import { loadConfig } from "@caffeineai/core-infrastructure";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { createActor } from "../backend";

interface AuthState {
  sessionToken: string | null;
  username: string | null;
  displayName: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<{ ok: true } | { err: string }>;
  register: (username: string, password: string, displayName: string) => Promise<{ ok: true } | { err: string }>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: true } | { err: string }>;
}

const SESSION_KEY = "mapmates_session";

const AuthContext = createContext<AuthContextValue | null>(null);

async function getActor() {
  const config = await loadConfig();
  const canisterId = config.backend_canister_id;
  return createActor(
    canisterId,
    async (blob) => blob._blob!,
    async (bytes) => {
      const { ExternalBlob } = await import("../backend");
      return ExternalBlob.fromBytes(bytes as Uint8Array<ArrayBuffer>);
    },
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    sessionToken: null,
    username: null,
    displayName: null,
    isAdmin: false,
    isAuthenticated: false,
    isInitializing: true,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem(SESSION_KEY);
    if (!storedToken) {
      setState((s) => ({ ...s, isInitializing: false }));
      return;
    }

    (async () => {
      try {
        const actor = await getActor();
        const result = await actor.validateSession(storedToken);
        if (result.__kind__ === "ok") {
          setState({
            sessionToken: storedToken,
            username: result.ok.username,
            displayName: result.ok.displayName,
            isAdmin: result.ok.isAdmin,
            isAuthenticated: true,
            isInitializing: false,
          });
        } else {
          localStorage.removeItem(SESSION_KEY);
          setState((s) => ({ ...s, isInitializing: false }));
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
        setState((s) => ({ ...s, isInitializing: false }));
      }
    })();
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<{ ok: true } | { err: string }> => {
    try {
      const actor = await getActor();
      const result = await actor.loginUser(username, password);
      if (result.__kind__ === "ok") {
        const { sessionToken, displayName, isAdmin } = result.ok;
        localStorage.setItem(SESSION_KEY, sessionToken);
        setState({
          sessionToken,
          username: username.toLowerCase(),
          displayName,
          isAdmin,
          isAuthenticated: true,
          isInitializing: false,
        });
        return { ok: true };
      }
      return { err: result.err };
    } catch {
      return { err: "Sign in failed. Please try again." };
    }
  };

  const register = async (
    username: string,
    password: string,
    displayName: string,
  ): Promise<{ ok: true } | { err: string }> => {
    try {
      const actor = await getActor();
      const result = await (actor as any).register(username, password, displayName);
      if (result.__kind__ === "ok") return { ok: true };
      return { err: result.err };
    } catch {
      return { err: "Registration failed. Please try again." };
    }
  };

  const logout = async () => {
    const token = state.sessionToken;
    if (token) {
      try {
        const actor = await getActor();
        await actor.logoutUser(token);
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(SESSION_KEY);
    setState({
      sessionToken: null,
      username: null,
      displayName: null,
      isAdmin: false,
      isAuthenticated: false,
      isInitializing: false,
    });
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<{ ok: true } | { err: string }> => {
    if (!state.sessionToken) return { err: "Not signed in" };
    try {
      const actor = await getActor();
      const result = await (actor as any).changePassword(
        state.sessionToken,
        currentPassword,
        newPassword,
      );
      if (result.__kind__ === "ok") return { ok: true };
      return { err: result.err };
    } catch {
      return { err: "Failed to change password. Please try again." };
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
