import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  HeartPulse,
  Landmark,
  Loader2,
  RotateCcw,
  Stamp,
  UploadCloud,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import Card from "../components/Card";
import RiskRing from "../components/RiskRing";

// ASSUMPTION: a single backend endpoint accepts all three documents as
// multipart form data and returns the same profile + risk shape the app
// already uses. `api`'s baseURL is "/api" (see src/api/client.js), so this
// path is appended to that — the full request goes to
// {baseURL}/health-profile/analyze, e.g. api.post("/users/me/health-profile/analyze", formData, ...)
//
// !! If you still get a 404, this path does not match your backend's real
// route. Open your backend router file, find the health-profile route, and
// set ANALYZE_ENDPOINT below to whatever path is registered there (including
// any router-level prefix). Do not guess twice — grep your backend repo for
// "health-profile" or "health_profile" and copy the exact route string.
//
//   POST {baseURL}{ANALYZE_ENDPOINT}
//   FormData: bank_statement, health_report, habits_log
//   Response: { age, bmi, systolic_bp, glucose_level, smoker, family_history,
//               monthly_budget, preferred_benefits, diabetes_risk,
//               hypertension_risk, heart_disease_risk }
const ANALYZE_ENDPOINT = "/users/me/health-profile/analyze";

const ANALYSIS_STEPS = [
  { label: "Reading your bank statement", icon: Landmark },
  { label: "Extracting values from your health report", icon: HeartPulse },
  { label: "Reviewing your habits & lifestyle log", icon: ClipboardList },
  { label: "Computing your risk profile", icon: Activity },
];

const DOC_TYPES = [
  {
    key: "bank_statement",
    label: "Bank expenditure statement",
    hint: "PDF or CSV export from your bank, last 3 months",
    icon: Landmark,
    accept: ".pdf,.csv,.xlsx",
  },
  {
    key: "health_report",
    label: "Health report",
    hint: "Recent lab results or a doctor's summary (PDF or image)",
    icon: HeartPulse,
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "habits_log",
    label: "Habits & lifestyle log",
    hint: "Fitness tracker export, food diary, or short written summary",
    icon: ClipboardList,
    accept: ".pdf,.csv,.txt,.jpg,.jpeg,.png",
  },
];

function bmiCategory(bmi) {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: "Underweight", color: "text-signal bg-signal-light" };
  if (bmi < 25) return { label: "Normal range", color: "text-ledger-dark bg-ledger-light" };
  if (bmi < 30) return { label: "Overweight", color: "text-signal bg-signal-light" };
  return { label: "Obese range", color: "text-risk bg-risk-light" };
}

function bpCategory(sbp) {
  if (!sbp) return null;
  if (sbp < 120) return { label: "Normal", color: "text-ledger-dark bg-ledger-light" };
  if (sbp < 130) return { label: "Elevated", color: "text-signal bg-signal-light" };
  return { label: "High", color: "text-risk bg-risk-light" };
}

function riskLevel(value) {
  const pct = Math.round(value * 100);
  if (pct >= 60) return { label: "High", color: "text-risk" };
  if (pct >= 30) return { label: "Moderate", color: "text-signal" };
  return { label: "Low", color: "text-ledger-dark" };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Dropzone({ config, file, onSelect, onRemove, disabled, index }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const Icon = config.icon;

  function handleFiles(list) {
    if (list && list[0]) onSelect(config.key, list[0]);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-300 ease-out animate-fade-up will-change-transform ${disabled
          ? "border-line bg-paper/40 opacity-60"
          : dragOver
            ? "border-ledger bg-ledger-light/60 scale-[1.02] shadow-lift"
            : file
              ? "border-ledger/40 bg-ledger-light/30 shadow-soft"
              : "border-line hover:border-slate-light hover:-translate-y-0.5 hover:shadow-soft bg-white"
        }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* corner shimmer while idle & empty, a quiet nudge to upload */}
      {!file && !disabled && (
        <span className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden">
          <span className="absolute -inset-y-full -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-ledger-light/50 to-transparent animate-shimmer-sweep" />
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!file ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="relative w-full flex items-start gap-3 text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-ledger-light flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Icon size={16} className="text-ledger-dark" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-ink flex items-center gap-1.5">
              {config.label}
              <UploadCloud
                size={13}
                className="text-slate-light transition-transform duration-300 group-hover:-translate-y-0.5"
              />
            </div>
            <p className="text-xs text-slate mt-0.5">{config.hint}</p>
          </div>
        </button>
      ) : (
        <div className="relative flex items-center gap-3 animate-fade-up" style={{ animationDuration: "220ms" }}>
          <div className="w-9 h-9 rounded-lg bg-ledger-light flex items-center justify-center shrink-0 animate-pop">
            <FileCheck2 size={16} className="text-ledger-dark" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-ink truncate">{file.name}</div>
            <p className="text-xs text-slate mt-0.5">{formatBytes(file.size)} — ready to analyze</p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(config.key)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-slate-light hover:text-risk hover:bg-risk-light hover:rotate-90 shrink-0 transition-all duration-200"
              aria-label={`Remove ${config.label}`}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AnalysisProgress({ currentStep }) {
  const pct = Math.min(currentStep / (ANALYSIS_STEPS.length - 1), 1) * 100;

  return (
    <div className="py-2 animate-fade-up">
      <div className="relative pl-[15px]">
        {/* connecting rail + animated fill, a ledger tally line coming alive */}
        <div className="absolute left-[15px] top-3 bottom-3 w-px bg-slate/10" aria-hidden="true" />
        <div
          className="absolute left-[15px] top-3 w-px bg-ledger-dark transition-[height] duration-700 ease-out"
          style={{ height: `calc(${pct}% - ${pct > 0 ? "12px" : "0px"})` }}
          aria-hidden="true"
        />

        <div className="space-y-4">
          {ANALYSIS_STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <div
                key={step.label}
                className="relative flex items-center gap-3 animate-fade-up -ml-[15px]"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div
                  className={`relative w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${done
                      ? "bg-ledger-dark text-white"
                      : active
                        ? "bg-ledger-light text-ledger-dark ring-4 ring-ledger-light/50"
                        : "bg-white text-slate-light border border-line"
                    }`}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-full bg-ledger-dark/20 animate-ping-slow" />
                  )}
                  {done ? (
                    <CheckCircle2 size={14} className="animate-pop" />
                  ) : active ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Icon size={13} />
                  )}
                </div>
                <span
                  className={`text-sm transition-colors duration-300 ${done ? "text-slate" : active ? "text-ink font-medium" : "text-slate-light"
                    }`}
                >
                  {step.label}
                </span>
                {done && (
                  <CheckCircle2 size={12} className="text-ledger-dark/50 animate-fade-up ml-auto shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* overall progress bar, ticking up like a running total */}
      <div className="mt-4 h-1 rounded-full bg-slate/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-ledger-dark to-ledger transition-[width] duration-700 ease-out"
          style={{ width: `${Math.max(pct, 6)}%` }}
        />
      </div>
    </div>
  );
}

export default function HealthProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [risks, setRisks] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [files, setFiles] = useState({ bank_statement: null, health_report: null, habits_log: null });
  const [status, setStatus] = useState("idle"); // idle | analyzing | done | error
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [justFinished, setJustFinished] = useState(false);
  const stepTimer = useRef(null);

  useEffect(() => {
    api
      .get("/users/me/health-profile")
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setRisks({
            diabetes_risk: data.diabetes_risk,
            hypertension_risk: data.hypertension_risk,
            heart_disease_risk: data.heart_disease_risk,
          });
        }
      })
      .finally(() => setInitialLoading(false));

    return () => clearInterval(stepTimer.current);
  }, []);

  const allFilesReady = DOC_TYPES.every((d) => files[d.key]);

  function selectFile(key, file) {
    setFiles((f) => ({ ...f, [key]: file }));
  }
  function removeFile(key) {
    setFiles((f) => ({ ...f, [key]: null }));
  }

  async function analyze() {
    setStatus("analyzing");
    setError("");
    setCurrentStep(0);
    setJustFinished(false);

    clearInterval(stepTimer.current);
    stepTimer.current = setInterval(() => {
      setCurrentStep((s) => Math.min(s + 1, ANALYSIS_STEPS.length - 1));
    }, 1100);

    try {
      const formData = new FormData();
      DOC_TYPES.forEach((d) => formData.append(d.key, files[d.key]));

      const { data } = await api.post(ANALYZE_ENDPOINT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(stepTimer.current);
      setCurrentStep(ANALYSIS_STEPS.length);

      setTimeout(() => {
        setProfile(data);
        setRisks({
          diabetes_risk: data.diabetes_risk,
          hypertension_risk: data.hypertension_risk,
          heart_disease_risk: data.heart_disease_risk,
        });
        setStatus("done");
        setJustFinished(true);
        setTimeout(() => setJustFinished(false), 1400);
      }, 350);
    } catch (err) {
      clearInterval(stepTimer.current);

      const requestUrl = err?.config?.baseURL
        ? `${err.config.baseURL}${err.config.url}`
        : err?.config?.url || ANALYZE_ENDPOINT;

      if (err?.response?.status === 404) {
        // eslint-disable-next-line no-console
        console.error(
          `[HealthProfile] 404 from ${requestUrl}. ANALYZE_ENDPOINT does not match a real ` +
          `backend route — check your backend's router file and update ANALYZE_ENDPOINT in HealthProfile.jsx.`
        );
        setError(
          "This upload endpoint isn't wired up on the server yet (404). Check ANALYZE_ENDPOINT in HealthProfile.jsx against your backend routes."
        );
      } else if (err?.response?.status === 401) {
        setError("Your session expired. Please sign in again.");
      } else {
        setError(
          err?.response?.data?.detail || "Couldn't analyze those documents. Check the files and try again."
        );
      }
      setStatus("error");
    }
  }

  function reset() {
    setFiles({ bank_statement: null, health_report: null, habits_log: null });
    setStatus("idle");
    setCurrentStep(0);
    setError("");
  }

  const bmiCat = profile ? bmiCategory(profile.bmi) : null;
  const bpCat = profile ? bpCategory(profile.systolic_bp) : null;

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-20%) rotate(8deg); }
          100% { transform: translateX(420%) rotate(8deg); }
        }
        @keyframes pingSlow {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes stampIn {
          0% { transform: scale(2.2) rotate(-14deg); opacity: 0; }
          60% { transform: scale(0.94) rotate(-8deg); opacity: 1; }
          80% { transform: scale(1.04) rotate(-10deg); }
          100% { transform: scale(1) rotate(-9deg); opacity: 1; }
        }
        @keyframes ringGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
          50% { box-shadow: 0 0 0 6px var(--glow-color, rgba(0,0,0,0.05)); }
        }
        @keyframes headerUnderline {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .animate-fade-up { animation: fadeInUp 380ms ease-out both; }
        .animate-pop { animation: pop 380ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .animate-shimmer-sweep { animation: shimmerSweep 2.8s ease-in-out infinite; }
        .animate-ping-slow { animation: pingSlow 1.6s cubic-bezier(0.2, 0.6, 0.4, 1) infinite; }
        .animate-stamp-in { animation: stampIn 620ms cubic-bezier(0.2, 0.8, 0.3, 1.15) both; }
        .shadow-soft { box-shadow: 0 2px 10px -4px rgba(30, 41, 59, 0.12); }
        .shadow-lift { box-shadow: 0 10px 24px -8px rgba(30, 41, 59, 0.22); }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up, .animate-pop, .animate-pulse, .animate-spin,
          .animate-shimmer-sweep, .animate-ping-slow, .animate-stamp-in { animation: none !important; }
        }
      `}</style>

      <div className="animate-fade-up">
        <div className="eyebrow text-ledger-dark mb-1.5">Health Risk Stratification</div>
        <h1 className="font-display text-3xl text-ink relative inline-block">
          Your Health Profile
          <span
            className="absolute -bottom-1 left-0 h-[3px] w-full bg-ledger-light rounded-full origin-left"
            style={{ animation: "headerUnderline 500ms 150ms ease-out both" }}
          />
        </h1>
        <p className="text-sm text-slate mt-1.5 max-w-xl leading-relaxed">
          Upload your bank statement, a health report, and a habits log — we read them directly and
          compute your Coverage Fit Score. No forms to fill in.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card accent>
            {profile && status === "done" ? (
              <div className="space-y-5 animate-fade-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full border-2 border-ledger-dark/70 flex items-center justify-center text-ledger-dark shrink-0 ${justFinished ? "animate-stamp-in" : ""
                        }`}
                      style={{ transform: "rotate(-9deg)" }}
                      title="Analysis complete"
                    >
                      <Stamp size={13} />
                    </div>
                    <div className="eyebrow text-slate">Extracted from your documents</div>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="text-xs font-medium text-ledger-dark flex items-center gap-1.5 hover:underline group"
                  >
                    <RotateCcw size={12} className="transition-transform duration-500 group-hover:-rotate-180" />
                    Re-analyze with new documents
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    ["Age", `${profile.age} years`, null],
                    ["BMI", profile.bmi, bmiCat],
                    ["Systolic blood pressure", `${profile.systolic_bp} mmHg`, bpCat],
                    ["Glucose level", `${profile.glucose_level} mg/dL`, null],
                    ["Smoker", profile.smoker ? "Yes" : "No", null],
                    ["Family history of chronic illness", profile.family_history ? "Yes" : "No", null],
                    ["Monthly insurance budget", `\u20b9${Number(profile.monthly_budget).toLocaleString()}`, null],
                  ].map(([label, value, badge], i) => (
                    <div key={label} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                      <SummaryField label={label} value={value} badge={badge} />
                    </div>
                  ))}
                </div>

                {profile.preferred_benefits?.length > 0 && (
                  <div className="animate-fade-up" style={{ animationDelay: "420ms" }}>
                    <label className="text-xs font-medium text-slate block mb-2">
                      Preferred benefits (from your habits log)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(profile.preferred_benefits)
                        ? profile.preferred_benefits
                        : profile.preferred_benefits.split(",")
                      ).map((b, i) => (
                        <span
                          key={b}
                          className="text-xs px-3.5 py-1.5 rounded-full bg-ledger-light text-ledger-dark border border-ledger/20 animate-fade-up transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-soft"
                          style={{ animationDelay: `${460 + i * 50}ms` }}
                        >
                          {b.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/recommendations")}
                  className="btn-primary transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0"
                >
                  View recommendations {"\u2192"}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {initialLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate py-4">
                    <Loader2 size={15} className="animate-spin" /> Checking your profile...
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {DOC_TYPES.map((d, i) => (
                        <Dropzone
                          key={d.key}
                          config={d}
                          index={i}
                          file={files[d.key]}
                          onSelect={selectFile}
                          onRemove={removeFile}
                          disabled={status === "analyzing"}
                        />
                      ))}
                    </div>

                    {status === "analyzing" && <AnalysisProgress currentStep={currentStep} />}

                    {status === "error" && (
                      <div className="flex items-start gap-2 text-sm text-risk bg-risk-light border border-risk/20 rounded-lg px-4 py-2.5 animate-fade-up">
                        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        disabled={!allFilesReady || status === "analyzing"}
                        onClick={analyze}
                        className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed transition-transform duration-200 enabled:hover:-translate-y-0.5 enabled:hover:shadow-lift active:translate-y-0"
                      >
                        {status === "analyzing" ? (
                          <>
                            <Loader2 size={14} className="animate-spin" /> Analyzing documents...
                          </>
                        ) : (
                          <>
                            <UploadCloud size={14} /> Analyze my documents
                          </>
                        )}
                      </button>
                      {!allFilesReady && status !== "analyzing" && (
                        <span className="text-xs text-slate-light animate-fade-up">
                          Upload all three documents to continue
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card eyebrow="ML Risk Classifiers" title="Estimated Risk" accent>
            {risks ? (
              <div className="animate-fade-up">
                <div className="flex justify-between px-1 py-2 mb-4">
                  {[
                    ["Diabetes", risks.diabetes_risk],
                    ["Hypertension", risks.hypertension_risk],
                    ["Heart disease", risks.heart_disease_risk],
                  ].map(([label, value], i) => (
                    <div
                      key={label}
                      className="animate-pop rounded-full"
                      style={{ animationDelay: `${i * 130}ms` }}
                    >
                      <RiskRing label={label} value={value} size={82} />
                    </div>
                  ))}
                </div>
                <div className="border-t border-line pt-3.5 space-y-1.5">
                  {[
                    ["Diabetes", risks.diabetes_risk],
                    ["Hypertension", risks.hypertension_risk],
                    ["Heart disease", risks.heart_disease_risk],
                  ].map(([label, value], i) => {
                    const lvl = riskLevel(value);
                    return (
                      <div
                        key={label}
                        className="flex items-center justify-between text-xs animate-fade-up"
                        style={{ animationDelay: `${300 + i * 70}ms` }}
                      >
                        <span className="text-slate">{label}</span>
                        <span className={`font-medium ${lvl.color}`}>{lvl.label} risk</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate">
                Upload your documents and run the analysis to see risk estimates here.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryField({ label, value, badge }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate">{label}</span>
        {badge && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
        )}
      </div>
      <div className="text-sm text-ink font-medium bg-paper/60 border border-line rounded-lg px-3.5 py-2.5 transition-shadow duration-200 hover:shadow-soft">
        {value}
      </div>
    </div>
  );
}