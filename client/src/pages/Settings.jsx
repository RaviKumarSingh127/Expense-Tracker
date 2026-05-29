import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/api/authApi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const Section = ({ title, children }) => (
  <Card className="space-y-4">
    <h3 className="text-base font-bold text-text-primary border-b border-border pb-3">{title}</h3>
    {children}
  </Card>
);

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    currency: user?.currency || "INR",
    theme: user?.theme || "dark",
    budgetAlertThreshold: user?.budgetAlertThreshold || 80,
    aiEnabled: user?.aiEnabled ?? true,
    emailNotifications: user?.emailNotifications ?? true,
  });
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });

  const profileMutation = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: ({ data }) => {
      updateUser(data.data.user);
      toast.success("Profile updated");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed");
      setPwdForm({ currentPassword: "", newPassword: "", confirm: "" });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) { toast.error("Passwords don't match"); return; }
    if (pwdForm.newPassword.length < 8) { toast.error("Password must be 8+ characters"); return; }
    passwordMutation.mutate({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <Section title="Profile">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-text-primary">{user?.name}</p>
            <p className="text-sm text-text-muted">{user?.email}</p>
          </div>
        </div>
        <Input
          label="Display Name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Currency</label>
            <select value={profile.currency} onChange={(e) => setProfile({ ...profile, currency: e.target.value })} className="input-base">
              {["INR", "USD", "EUR", "GBP", "AED"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Budget Alert At</label>
            <div className="flex items-center gap-2">
              <input
                type="range" min="50" max="100" step="5"
                value={profile.budgetAlertThreshold}
                onChange={(e) => setProfile({ ...profile, budgetAlertThreshold: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-medium text-primary w-10">{profile.budgetAlertThreshold}%</span>
            </div>
          </div>
        </div>
        <Button onClick={() => profileMutation.mutate(profile)} isLoading={profileMutation.isPending}>
          Save Profile
        </Button>
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <div className="space-y-3">
          {[
            { key: "aiEnabled", label: "AI Features", desc: "Enable AI categorization, insights, and chatbot" },
            { key: "emailNotifications", label: "Email Notifications", desc: "Receive budget alerts via email" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-surface-2">
              <div>
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-xs text-text-muted">{desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile[key]}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface peer-checked:bg-primary rounded-full peer peer-focus:ring-0 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
          ))}
        </div>
        <Button onClick={() => profileMutation.mutate(profile)} variant="ghost" isLoading={profileMutation.isPending}>
          Save Preferences
        </Button>
      </Section>

      {/* Security */}
      <Section title="Security">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={pwdForm.currentPassword}
            onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
            placeholder="••••••••"
            required
          />
          <Input
            label="New Password"
            type="password"
            value={pwdForm.newPassword}
            onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
            placeholder="At least 8 characters"
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={pwdForm.confirm}
            onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
            placeholder="••••••••"
            required
          />
          <Button type="submit" isLoading={passwordMutation.isPending}>
            Change Password
          </Button>
        </form>
      </Section>

      {/* App Info */}
      <Section title="About FlowFin">
        <div className="space-y-2 text-sm text-text-muted">
          <p>Version 1.0.0 · Production-grade MERN stack application</p>
          <p>Powered by Google Gemini AI · Built with React 18 + Node.js</p>
          <p className="text-xs">Your data is encrypted and never sold to third parties.</p>
        </div>
      </Section>
    </div>
  );
}
