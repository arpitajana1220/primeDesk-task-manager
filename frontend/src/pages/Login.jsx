import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, User as UserIcon, ArrowRight } from "lucide-react";

import { AuthContext } from "../auth/AuthContext";
// import api from "../api/axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await login(username, password);

      // alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="font-semibold text-2xl">TaskManager</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-600">
            Sign in to continue to your dashboard
          </p>
        </div>
        {error && (
          <p className="text-red-500 text-sm mb-3">
            {error}
          </p>
        )}
        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Username
              </label>

              <div className="relative">
                <UserIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight size={20} />
            </button>

          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
