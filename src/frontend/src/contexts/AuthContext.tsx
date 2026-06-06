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
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: true } | { err: string }>;
  register: (
    username: string,
    password: string,
    email: string,
    displayName: string,
  ) => Promise<{ ok: string } | { err: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ ok: true } | { err: string }>;
  verifyEmail: (token: string) => Promise<{ ok: true } | { err: string }>;
  resendVerification: (username: string) => Promise<{ ok: string } | { err: string }>;
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

  // On mount — restore session from localStorage
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
          username,
          displayName,
          isAdmin,
          isAuthenticated: true,
          isInitializing: false,
        });
        return { ok: true };
      }
      return { err: result.err };
    } catch {
      return { err: "Login failed. Please try again." };
    }
  };

  const register = async (
    username: string,
    password: string,
    email: string,
    displayName: string,
  ): Promise<{ ok: string } | { err: string }> => {
    try {
      const actor = await getActor();
      const result = await actor.register(
        username,
        password,
        email,
        displayName,
      );
      if (result.__kind__ === "ok") return { ok: result.ok };
      return { err: result.err };
    } catch {
      return { err: "Registration failed. Please try again." };
    }
  };

  const verifyEmail = async (
    token: string,
  ): Promise<{ ok: true } | { err: string }> => {
    try {
      const actor = await getActor();
      const result = await actor.verifyEmail(token);
      if (result.__kind__ === "ok") return { ok: true };
      return { err: result.err };
    } catch {
      return { err: "Verification failed. Please try again." };
    }
  };

  const resendVerification = async (
    username: string,
  ): Promise<{ ok: string } | { err: string }> => {
    try {
      const actor = await getActor();
      const result = await actor.resendVerification(username);
      if (result.__kind__ === "ok") return { ok: result.ok };
      return { err: result.err };
    } catch {
      return { err: "Could not resend verification." };
    }
  };

  const logout = async () => {
    const token = state.sessionToken;
    if (token) {
      try {
        const actor = await getActor();
        await actor.logoutUser(token);
      } catch {
        // ignore logout errors
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

  const forgotPassword = async (
    email: string,
  ): Promise<{ ok: true } | { err: string }> => {
    try {
      const actor = await getActor();
      const result = await actor.forgotPassword(email);
      if (result.__kind__ === "ok") return { ok: true };
      return { err: result.err };
    } catch {
      return { err: "Failed to send reset email. Please try again." };
    }
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, forgotPassword, verifyEmail, resendVerification }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
