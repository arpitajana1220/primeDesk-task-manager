import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import api from "../api/axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      setLoading(true);

      await api.post("users/register/", {
        username,
        email,
        password,
      });

      navigate("/", { state: { registered: true } });
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        // DRF sends { field_name: ["message", ...], ... }
        const fieldErrors = {};
        Object.entries(data).forEach(([field, messages]) => {
          fieldErrors[field] = Array.isArray(messages)
            ? messages.join(" ")
            : String(messages);
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: "Registration failed. Please try again." });
      }

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

          <h1 className="text-3xl font-bold mb-2">Create an account</h1>
          <p className="text-gray-600">
            Start managing your tasks efficiently
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {errors.general && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

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
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.username ? "border-red-400" : ""
                  }`}
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && (
                <p className="text-red-600 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-400" : ""
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
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
                  minLength={8}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? "border-red-400" : ""
                  }`}
                  placeholder="Min 8 characters, not too common"
                />
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
              <ArrowRight size={20} />
            </button>

          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}