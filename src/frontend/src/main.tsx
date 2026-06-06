import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// ── Error Boundary ────────────────────────────────────────────────────────────
interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends React.Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[MapMates] Uncaught error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d1117 100%)",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <img
            src="https://i.imgur.com/OmgQN1q.png"
            alt="MapMates"
            style={{
              height: 64,
              width: "auto",
              marginBottom: "1.5rem",
              opacity: 0.9,
            }}
          />
          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Something went wrong
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.875rem",
              marginBottom: "2rem",
              maxWidth: 400,
            }}
          >
            Please refresh the page to continue.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "0.625rem 1.75rem",
              background: "rgba(59,130,246,0.85)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.9375rem",
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Never throw globally — individual queries handle errors
      throwOnError: false,
      retry: 1,
    },
    mutations: {
      throwOnError: false,
    },
  },
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <InternetIdentityProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </InternetIdentityProvider>
  </ErrorBoundary>,
);
