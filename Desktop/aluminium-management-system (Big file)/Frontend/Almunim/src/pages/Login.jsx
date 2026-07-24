import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      // Expected backend endpoint: POST /api/Auth/login  { username, password }
      // Adjust the path below if your controller uses a different route.
      const res = await api.post("/Auth/login", { username, password });
      login(res.data);
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-lg bg-emerald-500 text-slate-900 font-bold text-2xl flex items-center justify-center">
            A
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-800">Almunim</h1>
          <p className="text-sm text-gray-500">Aluminium Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Sign in</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
            <input
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ahmed_admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Demo users come from the Users table in AluminiumMgtDB.
          </p>
        </form>
      </div>
    </div>
  );
}
