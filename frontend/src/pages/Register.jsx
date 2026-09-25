import {
  ArrowRight,
  ShieldCheck,
  User,
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

const ROLES = [
  {
    value: "customer",
    label: "Insurance Customer",
    desc: "Find and manage insurance policies.",
  },
  {
    value: "provider",
    label: "Healthcare Provider",
    desc: "Manage claims and patient workflow.",
  },
];

export default function Register() {

  const { register, loading } = useAuth();

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "customer",
  });

  function update(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (form.role === "admin") {
      setError("Administrator registration is not allowed.");
      return;
    }

    try {
      await register(
        form.full_name,
        form.email,
        form.password,
        form.role
      );

      navigate("/");

    } catch (err) {

      setError(
        err?.response?.data?.detail ||
        "Could not create your account."
      );

    }
  }

  return (

    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-100">

      {/* ================= LEFT PANEL ================= */}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 text-white">

        <div className="absolute w-[450px] h-[450px] bg-emerald-500/20 rounded-full blur-[180px] -top-24 -left-20" />

        <div className="absolute w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[180px] bottom-0 right-0" />

        <div className="relative z-10 flex flex-col justify-between w-full p-14">

          <div>

            <div className="flex items-center gap-3 mb-12">

              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center">

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

            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 mb-8">

              <HeartPulse size={16} />

              Join Healthcare AI

            </div>

            <h1 className="text-6xl font-bold leading-tight">

              Build

              <span className="block italic text-emerald-400">

                your healthcare future.

              </span>

            </h1>

            <p className="mt-8 text-lg text-slate-300 leading-8 max-w-xl">

              Experience intelligent insurance,
              AI recommendations,
              claim management,
              healthcare automation,
              and secure workflows
              all from one platform.

            </p>

            <div className="grid grid-cols-2 gap-5 mt-14">

              <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 hover:scale-105 transition">

                <Activity className="text-emerald-400 mb-3" />

                <h3 className="font-semibold">

                  Automation

                </h3>

                <p className="text-sm text-slate-400 mt-2">

                  Workflow automation powered by AI.

                </p>

              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 hover:scale-105 transition">

                <BrainCircuit className="text-cyan-400 mb-3" />

                <h3>

                  AI Advisor

                </h3>

                <p className="text-sm text-slate-400 mt-2">

                  Smart insurance decisions.

                </p>

              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 hover:scale-105 transition">

                <ClipboardCheck className="text-green-400 mb-3" />

                <h3>

                  Claims

                </h3>

                <p className="text-sm text-slate-400 mt-2">

                  Fast approval process.

                </p>

              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 hover:scale-105 transition">

                <HeartPulse className="text-pink-400 mb-3" />

                <h3>

                  Health

                </h3>

                <p className="text-sm text-slate-400 mt-2">

                  Secure patient records.

                </p>

              </div>

            </div>

          </div>

          <p className="text-slate-400">

            © 2026 InsureSync AI

          </p>

        </div>

      </div>

      {/* ================= RIGHT PANEL ================= */}

      <div className="flex-1 flex justify-center items-center p-10">

        <div className="w-full max-w-md">

          <div className="bg-white/90 backdrop-blur-2xl rounded-[36px] border border-slate-200 shadow-2xl p-10">

            <div className="flex justify-center">

              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex justify-center items-center shadow-xl">

                <ShieldCheck
                  size={38}
                  className="text-white"
                />

              </div>

            </div>

            <h1 className="text-4xl font-bold text-center mt-6">

              Create Account

            </h1>

            <p className="text-center text-slate-500 mt-3 mb-10">

              Join the future of Healthcare & Insurance.

            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* FULL NAME */}

              <div>

                <label className="font-semibold text-slate-700">

                  Full Name

                </label>

                <div className="relative mt-2">

                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input

                    value={form.full_name}

                    onChange={(e) => update("full_name", e.target.value)}

                    placeholder="John Doe"

                    required

                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-400 outline-none transition"

                  />

                </div>

              </div>

              {/* EMAIL */}

              <div>

                <label className="font-semibold text-slate-700">

                  Email

                </label>

                <div className="relative mt-2">

                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input

                    type="email"

                    value={form.email}

                    onChange={(e) => update("email", e.target.value)}

                    placeholder="you@example.com"

                    required

                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-400 outline-none transition"

                  />

                </div>

              </div>              {/* PASSWORD */}

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
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="Create a strong password"
                    required
                    minLength={6}
                    className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-400 outline-none transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-600"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>

                </div>

              </div>

              {/* ROLE */}

              <div>

                <label className="font-semibold text-slate-700 block mb-3">

                  Select Your Role

                </label>

                <div className="space-y-3">

                  {ROLES.map((role) => (

                    <button
                      key={role.value}
                      type="button"
                      onClick={() => update("role", role.value)}
                      className={`w-full text-left rounded-2xl border p-5 transition-all duration-300 hover:shadow-xl ${form.role === role.value
                          ? "border-emerald-500 bg-emerald-50 shadow-lg"
                          : "border-slate-200 hover:border-emerald-300"
                        }`}
                    >

                      <div className="flex justify-between items-center">

                        <div>

                          <h3 className="font-semibold text-slate-800">

                            {role.label}

                          </h3>

                          <p className="text-sm text-slate-500 mt-1">

                            {role.desc}

                          </p>

                        </div>

                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${form.role === role.value
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-slate-300"
                            }`}
                        >
                          {form.role === role.value && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                          )}
                        </div>

                      </div>

                    </button>

                  ))}

                </div>

              </div>

              {/* ERROR */}

              {error && (

                <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">

                  {error}

                </div>

              )}

              {/* REGISTER BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white text-lg font-semibold shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex justify-center items-center gap-3 disabled:opacity-60"
              >

                {loading ? (

                  <>

                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                    Creating Account...

                  </>

                ) : (

                  <>

                    Create Account

                    <ArrowRight size={20} />

                  </>

                )}

              </button>

            </form>

            {/* Divider */}

            <div className="relative my-8">

              <div className="border-t border-slate-200"></div>

              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-sm text-slate-400">

                Secure Registration

              </span>

            </div>

            {/* LOGIN */}

            <div className="text-center">

              <p className="text-slate-600">

                Already have an account?

              </p>

              <Link
                to="/login"
                className="inline-flex justify-center items-center mt-4 w-full py-3 rounded-xl border border-emerald-500 text-emerald-600 font-semibold hover:bg-emerald-500 hover:text-white transition-all duration-300"
              >

                Sign In

              </Link>

            </div>

            {/* SECURITY */}

            <div className="grid grid-cols-3 gap-3 mt-8">

              <div className="rounded-xl border bg-slate-50 p-3 text-center">

                <ShieldCheck
                  size={20}
                  className="mx-auto text-emerald-500 mb-2"
                />

                <p className="text-xs text-slate-500">

                  Encrypted

                </p>

              </div>

              <div className="rounded-xl border bg-slate-50 p-3 text-center">

                <Activity
                  size={20}
                  className="mx-auto text-cyan-500 mb-2"
                />

                <p className="text-xs text-slate-500">

                  Secure

                </p>

              </div>

              <div className="rounded-xl border bg-slate-50 p-3 text-center">

                <BrainCircuit
                  size={20}
                  className="mx-auto text-indigo-500 mb-2"
                />

                <p className="text-xs text-slate-500">

                  AI Powered

                </p>

              </div>

            </div>

            {/* FOOTER */}

            <div className="mt-8 text-center text-xs text-slate-400 leading-6">

              <p>

                Protected with enterprise-grade security,
                encrypted authentication,
                and AI-powered healthcare technology.

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