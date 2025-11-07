import React, { useState } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import "../../index.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;
      login(token, user);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Check email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-gradient flex items-center justify-center min-h-screen">
      {/* --- Glass Container --- */}
      <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-8 w-[90%] sm:w-[400px] animate-fade-in">
        {/* --- Header --- */}
        <h2 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">
          Welcome Back
        </h2>
        <p className="text-center text-gray-700 text-xl font-semibold mb-6">
          Log in to manage your slots and swaps
        </p>

        {/* --- Form --- */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder=" "
              className="peer w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-300 focus:outline-none placeholder-transparent"
            />
            <label
              htmlFor="email"
              className="absolute left-4 -top-2.5 bg-white/70 px-1 text-gray-500 text-sm transition-all 
              peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent
              peer-focus:-top-2.5 peer-focus:text-purple-600 peer-focus:text-sm"
            >
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
              className="peer w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-300 focus:outline-none placeholder-transparent"
            />
            <label
              htmlFor="password"
              className="absolute left-4 -top-2.5 bg-white/70 px-1 text-gray-500 text-sm transition-all 
              peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent
              peer-focus:-top-2.5 peer-focus:text-purple-600 peer-focus:text-sm"
            >
              Password
            </label>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center animate-pulse">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-xl rounded-lg text-white font-semibold transition-all duration-300
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg"
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* --- Footer Links --- */}
        <p className="text-sm text-center text-gray-700 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-purple-600 text-lg  font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
