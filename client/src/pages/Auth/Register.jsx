import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    const result = await register(form);
    if (result.success) navigate("/dashboard");
    else setError(result.message || "Registration failed");
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary shadow-glow flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl font-display">FF</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text font-display">FlowFin</h1>
          <p className="text-text-muted mt-2">Start your financial journey today</p>
        </div>

        <div className="glass-card">
          <h2 className="text-xl font-bold text-text-primary mb-6">Create account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 8 characters"
              required
              rightElement={
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="text-text-muted hover:text-text-primary">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-text-muted">
              <span className="bg-[#13131A] px-3">or sign up with</span>
            </div>
          </div>

          <a href="http://localhost:5000/api/auth/google">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border bg-surface-2 hover:bg-border text-text-primary text-sm font-medium transition-all duration-200 active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.8 33.3 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.9-5.9C34.1 6.5 29.3 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5c11 0 20.5-8 20.5-20.5 0-1.2-.1-2.3-.3-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.7 18.9 13 24 13c3 0 5.7 1.1 7.8 2.9l5.9-5.9C34.1 6.5 29.3 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 10.2z" />
                <path fill="#4CAF50" d="M24 45.5c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 37 26.9 38 24 38c-5.3 0-9.8-3.6-11.3-8.5l-6.6 5.1C9.6 41 16.3 45.5 24 45.5z" />
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.4-2.3 4.4-4.3 5.8l6.2 5.2c3.7-3.4 5.8-8.4 5.8-14-.1-1.3-.2-2.5-.4-3z" />
              </svg>
              Continue with Google
            </button>
          </a>

          <p className="text-center text-sm text-text-muted mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
