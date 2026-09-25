import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Activity,
  BrainCircuit,
  ClipboardCheck,
  HeartPulse,
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {

  const { login, loading } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [remember, setRemember] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(e) {

    e.preventDefault();

    setError("");

    try {

      await login(email, password);

      if (remember) {

        localStorage.setItem("remember", "true");

      }

      navigate("/");

    }

    catch (err) {

      setError(

        err?.response?.data?.detail ||

        "Invalid Email or Password."

      );

    }

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-100 flex overflow-hidden">

      {/* LEFT SIDE */}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 text-white">

        <div className="absolute w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[180px] -top-40 -left-32" />

        <div className="absolute w-[450px] h-[450px] bg-cyan-500/20 rounded-full blur-[180px] bottom-0 right-0" />

        <div className="relative z-10 flex flex-col justify-between w-full p-14">

          <div>

            <div className="flex items-center gap-3 mb-12">

              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex justify-center items-center">

                <ShieldCheck
                  size={28}
                  className="text-emerald-400"
                />

              </div>

              <div>

                <h1 className="text-3xl font-bold">

                  InsureSync AI

                </h1>

                <p className="text-sm text-slate-400">

                  Healthcare Intelligence Platform

                </p>

              </div>

            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 mb-10">

              <Sparkles size={16} />

              AI Powered Healthcare

            </div>

            <h1 className="text-6xl font-bold leading-tight">

              Insurance

              <span className="italic text-emerald-400 block">

                Made Smarter.

              </span>

            </h1>

            <p className="text-slate-300 leading-8 text-lg mt-8 max-w-xl">

              One intelligent platform for

              Healthcare,

              Insurance,

              AI Recommendations,

              Workflow Automation,

              Claims Processing,

              and Smart Analytics.

            </p>

            <div className="grid grid-cols-2 gap-5 mt-14">

              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:scale-105 transition duration-300">

                <Activity className="text-emerald-400 mb-3" />

                <h3 className="font-semibold">

                  Live Workflow

                </h3>

                <p className="text-sm text-slate-400 mt-2">

                  Real-time claim tracking.

                </p>

              </div>

              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:scale-105 transition">

                <BrainCircuit className="text-cyan-400 mb-3" />

                <h3 className="font-semibold">

                  AI Advisor

                </h3>

                <p className="text-sm text-slate-400 mt-2">

                  Intelligent recommendations.

                </p>

              </div>

              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:scale-105 transition">

                <ClipboardCheck className="text-green-400 mb-3" />

                <h3>

                  Claims

                </h3>

                <p className="text-sm text-slate-400 mt-2">

                  Fast Approvals

                </p>

              </div>

              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:scale-105 transition">

                <HeartPulse className="text-pink-400 mb-3" />

                <h3>

                  Healthcare

                </h3>

                <p className="text-sm text-slate-400 mt-2">

                  Smart Patient Management

                </p>

              </div>

            </div>

          </div>

          <div className="text-slate-400">

            © 2026 InsureSync AI

          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="flex-1 flex justify-center items-center p-10">

        <div className="w-full max-w-md">

          <div className="bg-white/90 backdrop-blur-2xl rounded-[36px] shadow-2xl border border-slate-200 p-10">

            <div className="flex justify-center">

              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex justify-center items-center shadow-xl">

                <ShieldCheck
                  size={38}
                  className="text-white"
                />

              </div>

            </div>

            <h1 className="text-4xl font-bold text-center mt-6">

              Welcome Back

            </h1>

            <p className="text-center text-slate-500 mt-3 mb-10">

              Login to continue your Healthcare Workspace

            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* EMAIL */}

              <div>

                <label className="font-semibold text-slate-700">

                  Email Address

                </label>

                <div className="relative mt-2">

                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input

                    type="email"

                    placeholder="Enter your email"

                    value={email}

                    onChange={(e) => setEmail(e.target.value)}

                    required

                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-400 outline-none transition"

                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div>

                <label className="font-semibold text-slate-700">

                  Password

                </label>

                <div className="relative mt-2">

                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input

                    type={showPassword ? "text" : "password"}

                    placeholder="Enter your password"

                    value={password}

                    onChange={(e) => setPassword(e.target.value)}

                    required

                    className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-400 outline-none transition"

                  />

                  <button

                    type="button"

                    onClick={() => setShowPassword(!showPassword)}

                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"

                  >

                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}

                  </button>

                </div>

              </div>              {/* Remember Me & Forgot Password */}

              <div className="flex items-center justify-between">

                <label className="flex items-center gap-3 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />

                  <span className="text-sm text-slate-600">
                    Remember Me
                  </span>

                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition"
                >
                  Forgot Password?
                </Link>

              </div>

              {/* Error Message */}

              {error && (

                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                  {error}

                </div>

              )}

              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white font-semibold text-lg shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-3"
              >

                {loading ? (

                  <>

                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                    Signing In...

                  </>

                ) : (

                  <>

                    Sign In

                    <ArrowRight size={20} />

                  </>

                )}

              </button>

            </form>

            {/* Divider */}

            <div className="relative my-8">

              <div className="border-t border-slate-200"></div>

              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-sm text-slate-400">

                Secure Login

              </span>

            </div>

            {/* Register */}

            <div className="text-center">

              <p className="text-slate-600">

                Don't have an account?

              </p>

              <Link
                to="/register"
                className="inline-flex items-center justify-center mt-4 w-full py-3 rounded-xl border border-emerald-500 text-emerald-600 font-semibold hover:bg-emerald-500 hover:text-white transition-all duration-300"
              >

                Create Account

              </Link>

            </div>

            {/* Security Badges */}

            <div className="grid grid-cols-3 gap-3 mt-8">

              <div className="rounded-xl bg-slate-50 p-3 text-center border">

                <ShieldCheck
                  className="mx-auto text-emerald-500 mb-2"
                  size={20}
                />

                <p className="text-xs text-slate-500">

                  256-bit Encryption

                </p>

              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-center border">

                <Activity
                  className="mx-auto text-cyan-500 mb-2"
                  size={20}
                />

                <p className="text-xs text-slate-500">

                  Live Monitoring

                </p>

              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-center border">

                <BrainCircuit
                  className="mx-auto text-indigo-500 mb-2"
                  size={20}
                />

                <p className="text-xs text-slate-500">

                  AI Secured

                </p>

              </div>

            </div>

            {/* Footer */}

            <div className="mt-8 text-center text-xs text-slate-400 leading-6">

              <p>
                Protected with enterprise-grade security,
                AI-powered authentication,
                and encrypted healthcare data.
              </p>

              <p className="mt-2">

                © 2026 InsureSync AI. All Rights Reserved.

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}