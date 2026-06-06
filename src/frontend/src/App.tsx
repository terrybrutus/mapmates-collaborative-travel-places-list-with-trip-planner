import { Eye, EyeOff, Loader } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import React from "react";
import Dashboard from "./components/Dashboard";
import { useAuth } from "./contexts/AuthContext";
import { useSafeLandingPageVideo } from "./hooks/useQueries";

// ── Minimal error boundary to silently swallow backend-dependent child crashes ─
class SilentErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { crashed: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { crashed: false };
  }
  static getDerivedStateFromError() {
    return { crashed: true };
  }
  render() {
    if (this.state.crashed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

// ── Video hook isolated in its own component so crashes stay contained ─────────
function LandingVideoLoader({
  onVideo,
}: {
  onVideo: (videoUrl?: string, posterUrl?: string) => void;
}) {
  const { videoUrl, posterUrl } = useSafeLandingPageVideo();
  useEffect(() => {
    onVideo(videoUrl, posterUrl);
  }, [videoUrl, posterUrl, onVideo]);
  return null;
}

// ── Landing page dark gradient fallback (always visible) ────────────────────
const FALLBACK_BG =
  "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d1117 100%)";

// ── Video background for landing page ──────────────────────────────────────
function LandingVideoBackground({
  videoUrl,
  posterUrl,
}: {
  videoUrl: string;
  posterUrl?: string;
}) {
  if (!videoUrl) return null;

  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative background video
    <video
      className="absolute inset-0 w-full h-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      tabIndex={-1}
      poster={posterUrl}
      aria-hidden="true"
      onError={(e) => {
        // If video fails to load, hide it so the fallback gradient shows
        const el = e.currentTarget as HTMLVideoElement;
        el.style.display = "none";
      }}
    >
      <source src={videoUrl} type="video/mp4" />
    </video>
  );
}

// ── Auth Modal ───────────────────────────────────────────────────────────────
type AuthTab = "signin" | "register" | "forgot";

function AuthModal({ onClose }: { onClose: () => void }) {
  const { login, register, forgotPassword, verifyEmail, resendVerification } = useAuth();
  const [tab, setTab] = useState<AuthTab>("signin");

  // Sign in state
  const [siUsername, setSiUsername] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siShowPwd, setSiShowPwd] = useState(false);
  const [siError, setSiError] = useState("");
  const [siLoading, setSiLoading] = useState(false);

  // Register state
  const [regUsername, setRegUsername] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regShowPwd, setRegShowPwd] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  // set when backend requires email verification
  const [pendingVerifyUsername, setPendingVerifyUsername] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  // Forgot password state
  const [fpEmail, setFpEmail] = useState("");
  const [fpError, setFpError] = useState("");
  const [fpSuccess, setFpSuccess] = useState(false);
  const [fpLoading, setFpLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiError("");
    setSiLoading(true);
    try {
      const result = await login(siUsername.trim(), siPassword);
      if ("err" in result) setSiError(result.err);
    } catch {
      setSiError("Sign in failed. Please try again.");
    } finally {
      setSiLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (regPassword.length < 8) {
      setRegError("Password must be at least 8 characters.");
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError("Passwords do not match.");
      return;
    }
    setRegLoading(true);
    try {
      const result = await register(
        regUsername.trim(),
        regPassword,
        regEmail.trim(),
        regDisplayName.trim(),
      );
      if ("err" in result) {
        setRegError(result.err);
      } else {
        // Backend returns "VERIFY:token" when verification is required,
        // or a plain success message when verification is disabled
        if (result.ok.startsWith("VERIFY:")) {
          const token = result.ok.slice(7);
          setPendingVerifyUsername(regUsername.trim());
          setVerifyToken(token);
          setRegSuccess(true);
        } else {
          setRegSuccess(true);
          // Auto-fill sign in for seamless flow
          setSiUsername(regUsername.trim());
        }
      }
    } catch {
      setRegError("Registration failed. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError("");
    setVerifyLoading(true);
    try {
      const result = await verifyEmail(verifyToken.trim());
      if ("err" in result) {
        setVerifyError(result.err);
      } else {
        // Verified — go to sign in with username pre-filled
        setTab("signin");
        setSiUsername(pendingVerifyUsername);
        setPendingVerifyUsername("");
        setVerifyToken("");
        setRegSuccess(false);
      }
    } catch {
      setVerifyError("Verification failed. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendMsg("");
    setResendLoading(true);
    try {
      const result = await resendVerification(pendingVerifyUsername);
      if ("ok" in result) {
        // Update the displayed token if backend returns a new one
        if (result.ok.startsWith("VERIFY:")) {
          setVerifyToken(result.ok.slice(7));
        }
        setResendMsg("New code sent. Check your email or use the code shown below.");
      } else {
        setResendMsg("Could not resend. Please try again.");
      }
    } catch {
      setResendMsg("Could not resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError("");
    setFpLoading(true);
    try {
      const result = await forgotPassword(fpEmail.trim());
      if ("err" in result) {
        setFpError(result.err);
      } else {
        setFpSuccess(true);
      }
    } catch {
      setFpError("Failed to send reset email. Please try again.");
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <dialog
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent w-screen h-screen max-w-none max-h-none m-0 overflow-visible"
      open
      aria-modal="true"
      data-ocid="auth.dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl p-5 sm:p-6 backdrop-blur-xl overflow-y-auto max-h-[90dvh]"
        style={{
          background: "rgba(15, 23, 42, 0.97)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Tabs — only show for signin/register */}
        {tab !== "forgot" && (
          <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
            <button
              type="button"
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tab === "signin"
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
              onClick={() => {
                setTab("signin");
                setSiError("");
              }}
              data-ocid="auth.signin_tab"
            >
              Sign In
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tab === "register"
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
              onClick={() => {
                setTab("register");
                setRegError("");
                setRegSuccess(false);
              }}
              data-ocid="auth.register_tab"
            >
              Create Account
            </button>
          </div>
        )}

        {/* ── Sign In ── */}
        {tab === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label
                htmlFor="si-username"
                className="block text-sm text-white/70 mb-1"
              >
                Username
              </label>
              <input
                id="si-username"
                type="text"
                autoComplete="username"
                required
                value={siUsername}
                onChange={(e) => setSiUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
                placeholder="Your username"
                data-ocid="auth.username_input"
              />
            </div>
            <div>
              <label
                htmlFor="si-password"
                className="block text-sm text-white/70 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="si-password"
                  type={siShowPwd ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={siPassword}
                  onChange={(e) => setSiPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                  placeholder="Password"
                  data-ocid="auth.password_input"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  onClick={() => setSiShowPwd((v) => !v)}
                  aria-label={siShowPwd ? "Hide password" : "Show password"}
                >
                  {siShowPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {siError && (
              <p
                className="text-red-400 text-sm"
                data-ocid="auth.signin_error_state"
              >
                {siError}
              </p>
            )}
            <button
              type="submit"
              disabled={siLoading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-ocid="auth.signin_submit_button"
            >
              {siLoading && <Loader className="w-4 h-4 animate-spin" />}
              {siLoading ? "Signing in…" : "Sign In"}
            </button>
            <button
              type="button"
              className="w-full text-center text-sm text-white/50 hover:text-white/80 transition-colors py-1"
              onClick={() => {
                setTab("forgot");
                setFpError("");
                setFpSuccess(false);
              }}
              data-ocid="auth.forgot_password_link"
            >
              Forgot password?
            </button>
          </form>
        )}

        {/* ── Create Account ── */}
        {tab === "register" && !regSuccess && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label
                htmlFor="reg-username"
                className="block text-sm text-white/70 mb-1"
              >
                Username
              </label>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
                placeholder="Choose a username"
                data-ocid="auth.reg_username_input"
              />
            </div>
            <div>
              <label
                htmlFor="reg-displayname"
                className="block text-sm text-white/70 mb-1"
              >
                Display Name
              </label>
              <input
                id="reg-displayname"
                type="text"
                autoComplete="name"
                required
                value={regDisplayName}
                onChange={(e) => setRegDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
                placeholder="Your display name"
                data-ocid="auth.reg_displayname_input"
              />
            </div>
            <div>
              <label
                htmlFor="reg-email"
                className="block text-sm text-white/70 mb-1"
              >
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
                placeholder="your@email.com"
                data-ocid="auth.reg_email_input"
              />
            </div>
            <div>
              <label
                htmlFor="reg-password"
                className="block text-sm text-white/70 mb-1"
              >
                Password <span className="text-white/40">(min 8 chars)</span>
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={regShowPwd ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                  placeholder="Create a password"
                  data-ocid="auth.reg_password_input"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  onClick={() => setRegShowPwd((v) => !v)}
                  aria-label={regShowPwd ? "Hide password" : "Show password"}
                >
                  {regShowPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="reg-confirm"
                className="block text-sm text-white/70 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
                placeholder="Confirm your password"
                data-ocid="auth.reg_confirm_input"
              />
            </div>
            {regError && (
              <p
                className="text-red-400 text-sm"
                data-ocid="auth.register_error_state"
              >
                {regError}
              </p>
            )}
            <button
              type="submit"
              disabled={regLoading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-ocid="auth.register_submit_button"
            >
              {regLoading && <Loader className="w-4 h-4 animate-spin" />}
              {regLoading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}

        {tab === "register" && regSuccess && !pendingVerifyUsername && (
          <div
            className="text-center py-4 space-y-4"
            data-ocid="auth.register_success_state"
          >
            <div className="text-4xl">🎉</div>
            <p className="text-white font-semibold">Account created!</p>
            <p className="text-white/60 text-sm">You're all set. Sign in with your new credentials.</p>
            <button
              type="button"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
              onClick={() => { setTab("signin"); setRegSuccess(false); }}
            >
              Sign In Now
            </button>
          </div>
        )}

        {/* ── Email Verification Required ── */}
        {tab === "register" && regSuccess && pendingVerifyUsername && (
          <div className="space-y-4" data-ocid="auth.verify_email_state">
            <div className="text-center">
              <div className="text-4xl mb-2">✉️</div>
              <p className="text-white font-semibold">Verify your email</p>
              <p className="text-white/60 text-sm mt-1">
                Enter the verification code below. Check your inbox, or use the code shown here if email delivery is still being configured.
              </p>
            </div>
            {/* Show token inline as fallback when email may not be delivered */}
            {verifyToken && (
              <div className="p-3 rounded-lg text-center" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
                <p className="text-white/50 text-xs mb-1">Your verification code</p>
                <p className="text-blue-300 font-mono text-sm break-all select-all">{verifyToken}</p>
              </div>
            )}
            <form onSubmit={handleVerifyEmail} className="space-y-3">
              <input
                type="text"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                placeholder="Paste verification code"
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/60 font-mono text-sm"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                data-ocid="auth.verify_token_input"
              />
              {verifyError && <p className="text-red-400 text-sm">{verifyError}</p>}
              {resendMsg && <p className="text-blue-300 text-sm">{resendMsg}</p>}
              <button
                type="submit"
                disabled={verifyLoading || !verifyToken.trim()}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-ocid="auth.verify_submit_button"
              >
                {verifyLoading && <Loader className="w-4 h-4 animate-spin" />}
                {verifyLoading ? "Verifying…" : "Verify & Sign In"}
              </button>
            </form>
            <button
              type="button"
              disabled={resendLoading}
              onClick={handleResendVerification}
              className="w-full text-center text-sm text-white/50 hover:text-white/80 transition-colors py-1 disabled:opacity-50"
              data-ocid="auth.resend_verification_button"
            >
              {resendLoading ? "Sending…" : "Resend code"}
            </button>
          </div>
        )}

        {/* ── Forgot Password ── */}
        {tab === "forgot" && !fpSuccess && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="mb-2">
              <button
                type="button"
                className="text-sm text-white/50 hover:text-white/80 transition-colors flex items-center gap-1"
                onClick={() => setTab("signin")}
                data-ocid="auth.back_to_signin_link"
              >
                ← Back to Sign In
              </button>
            </div>
            <h3 className="text-white font-semibold text-lg">Reset Password</h3>
            <p className="text-white/60 text-sm">
              Enter your email and we'll send you a reset link.
            </p>
            <div>
              <label
                htmlFor="fp-email"
                className="block text-sm text-white/70 mb-1"
              >
                Email
              </label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                required
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
                placeholder="your@email.com"
                data-ocid="auth.forgot_email_input"
              />
            </div>
            {fpError && (
              <p
                className="text-red-400 text-sm"
                data-ocid="auth.forgot_error_state"
              >
                {fpError}
              </p>
            )}
            <button
              type="submit"
              disabled={fpLoading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-ocid="auth.forgot_submit_button"
            >
              {fpLoading && <Loader className="w-4 h-4 animate-spin" />}
              {fpLoading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        {tab === "forgot" && fpSuccess && (
          <div
            className="text-center py-4 space-y-4"
            data-ocid="auth.forgot_success_state"
          >
            <div className="text-4xl">📧</div>
            <p className="text-white font-semibold">Reset link sent!</p>
            <p className="text-white/60 text-sm">
              Check your inbox at <strong>{fpEmail}</strong> for instructions to
              reset your password.
            </p>
            <button
              type="button"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              onClick={() => setTab("signin")}
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}

// ── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0.5, y: 0.5 });
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [posterUrl, setPosterUrl] = useState<string | undefined>();

  const handleVideo = (v?: string, p?: string) => {
    setVideoUrl(v);
    setPosterUrl(p);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setCursorPosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const hue = Math.round(cursorPosition.x * 360);
  const lightness = 18 + cursorPosition.y * 8;

  // Dark cursor-following gradient for landing (dark theme so text stays white)
  const cursorBg = videoUrl
    ? undefined
    : `radial-gradient(circle 480px at ${cursorPosition.x * 100}% ${cursorPosition.y * 100}%, 
        hsl(${hue}, 55%, ${lightness + 6}%) 0%, 
        hsl(${(hue + 40) % 360}, 45%, ${lightness + 2}%) 40%, 
        hsl(${(hue + 90) % 360}, 35%, ${lightness}%) 75%, 
        #0a0a1a)`;

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col"
      style={{ background: FALLBACK_BG }}
      data-ocid="landing.page"
    >
      {/* Load video URL from backend; isolated so backend errors can't crash the page */}
      <SilentErrorBoundary>
        <LandingVideoLoader onVideo={handleVideo} />
      </SilentErrorBoundary>

      {/* ── Background layer ── */}
      {videoUrl ? (
        <LandingVideoBackground videoUrl={videoUrl} posterUrl={posterUrl} />
      ) : (
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{ background: cursorBg ?? FALLBACK_BG }}
          aria-hidden="true"
        />
      )}

      {/* ── Dark overlay for text contrast ── */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: videoUrl ? "rgba(0,0,0,0.62)" : "rgba(0,0,0,0.3)",
        }}
        aria-hidden="true"
      />

      {/* ── Content above both layers ── */}
      <div className="relative z-20 flex flex-col min-h-[100dvh]">
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          {/* Logo */}
          <div className="mb-6" data-ocid="landing.logo">
            <img
              src="https://i.imgur.com/OmgQN1q.png"
              alt="MapMates"
              className="mapmates-logo-landing mx-auto"
              style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.55))" }}
              onError={(e) => {
                // Hide broken logo gracefully
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          {/* Tagline */}
          <p className="landing-tagline mb-10" data-ocid="landing.tagline">
            YOUR WORLD. YOUR ADVENTURES.
          </p>

          {/* Hero CTA */}
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full font-bold text-lg tracking-wide text-white border-2 border-white/60 bg-white/10 backdrop-blur-sm hover:bg-white/25 hover:border-white/90 transition-all duration-300 shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            data-ocid="landing.get_started_button"
          >
            Get Started
          </button>
        </main>

        {/* Footer */}
        <footer className="py-5 border-t border-white/15">
          <div className="container mx-auto px-4 text-center">
            <span className="text-white/60 text-sm">
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                className="text-white/85 hover:text-white font-medium transition-colors"
              >
                caffeine.ai
              </a>
            </span>
          </div>
        </footer>
      </div>

      {/* ── Auth Modal ── */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

// ── Email Verification Landing (handles /verify?token=... link clicks) ────────
function VerifyEmailPage({ token }: { token: string }) {
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    verifyEmail(token).then((result) => {
      if ("ok" in result) {
        setStatus("success");
        setMessage("Your email is verified! You can now sign in.");
        // Clear the token from URL without reload
        window.history.replaceState({}, "", "/");
      } else {
        setStatus("error");
        setMessage(result.err || "Verification failed. The link may have already been used.");
      }
    });
  }, [token, verifyEmail]);

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-6 text-center"
      style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d1117 100%)" }}
    >
      <div className="max-w-sm w-full space-y-4">
        <img src="https://i.imgur.com/OmgQN1q.png" alt="MapMates" className="h-12 w-auto mx-auto opacity-90" />
        {status === "pending" && (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-400/30 border-t-blue-400 mx-auto" />
            <p className="text-white/70">Verifying your email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-4xl">✅</div>
            <p className="text-white font-semibold">{message}</p>
            <button
              type="button"
              onClick={() => window.location.replace("/")}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
            >
              Sign In
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-4xl">⚠️</div>
            <p className="text-white/80 font-medium">{message}</p>
            <button
              type="button"
              onClick={() => window.location.replace("/")}
              className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
            >
              Back to MapMates
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated, isInitializing } = useAuth();
  const [cursorPosition, setCursorPosition] = useState({ x: 0.5, y: 0.5 });

  // Handle /verify?token=... email link clicks (must be after all hooks)
  const verifyToken = new URLSearchParams(window.location.search).get("token");
  const isVerifyRoute = window.location.pathname === "/verify" || (!!verifyToken && !isAuthenticated);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setCursorPosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Handle email verification link clicks (/verify?token=...)
  if (isVerifyRoute && verifyToken && !isInitializing) {
    return <VerifyEmailPage token={verifyToken} />;
  }

  // Show loading spinner while auth resolves — max ~5s before we show landing anyway
  if (isInitializing) {
    return (
      <div
        className="min-h-[100dvh] flex items-center justify-center"
        style={{ background: FALLBACK_BG }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400/30 border-t-blue-400 mx-auto mb-6" />
          <p className="text-white/80 text-lg font-medium tracking-wide">
            Preparing your adventure…
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard cursorPosition={cursorPosition} />;
  }

  return <LandingPage />;
}
