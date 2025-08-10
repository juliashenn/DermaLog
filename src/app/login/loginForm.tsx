"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const toggleMode = () => setIsLogin(!isLogin);
  const router = useRouter()

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
    }
  };

   const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      // Auto-login after signup
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        setError(loginRes.error);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="mb-6 text-2xl font-bold text-center font-family">Login</h2>
              <form className="space-y-4" onSubmit={handleLogin}>
                <input
                  type="email"
                  value={email}
                  required
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
                <input
                  type="password"
                  value={password}
                  required
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
                >
                  Login
                </button>
              </form>
              <button
                onClick={handleGoogleLogin}
                className="mt-4 w-full rounded-lg border border-gray-300 py-2 hover:bg-gray-50"
              >
                Continue with Google
              </button>
              <p className="mt-4 text-center text-sm">
                Don’t have an account?{" "}
                <button
                  onClick={toggleMode}
                  className="text-blue-500 hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="mb-6 text-2xl font-bold text-center">Create Account</h2>
              <form className="space-y-4" onSubmit={handleSignup}>
                <input
                  type="text"
                  value={name}
                  required
                  onChange={e => setName(e.target.value)}
                  placeholder="Name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
                <input
                  type="email"
                  value={email}
                  required
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
                <input
                  type="password"
                  value={password}
                  required
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
                >
                  Sign Up
                </button>
              </form>
              <button
                onClick={handleGoogleLogin}
                className="mt-4 w-full rounded-lg border border-gray-300 py-2 hover:bg-gray-50"
              >
                Continue with Google
              </button>
              <p className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <button
                  onClick={toggleMode}
                  className="text-blue-500 hover:underline"
                >
                  Login
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
