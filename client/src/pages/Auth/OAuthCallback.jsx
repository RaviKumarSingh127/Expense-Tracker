import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/api/authApi";
import toast from "react-hot-toast";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      toast.error("Google sign-in failed. Please try again.");
      navigate("/login");
      return;
    }

    const finishLogin = async () => {
      try {
        localStorage.setItem("accessToken", token);
        const { data } = await authApi.getMe();
        const user = data.data.user;

        useAuthStore.setState({ user, accessToken: token, isAuthenticated: true });
        toast.success(`Welcome, ${user.name.split(" ")[0]}! 🎉`);
        navigate("/dashboard");
      } catch {
        localStorage.removeItem("accessToken");
        toast.error("Login failed. Please try again.");
        navigate("/login");
      }
    };

    finishLogin();
  }, [navigate, updateUser]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary shadow-glow flex items-center justify-center mx-auto animate-pulse-soft">
          <span className="text-white font-bold text-xl">FF</span>
        </div>
        <p className="text-text-muted text-sm">Signing you in with Google...</p>
      </div>
    </div>
  );
}
