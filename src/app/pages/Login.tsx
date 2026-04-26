import React, { useState } from "react";
import { useNavigate } from "react-router";
import { MapPin } from "lucide-react";
import { signInUserProfile, signUpUserProfile } from "../lib/appData";

const languages = ["EN", "Kannada", "Hindi"];

export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("EN");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const normalizedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");
      if (mode === "signup") {
        await signUpUserProfile({ name, phone: normalizedPhone, language });
      } else {
        await signInUserProfile({ phone: normalizedPhone });
      }
      navigate("/");
    } catch (err: any) {
      setError(err?.message || `Unable to ${mode === "signup" ? "sign up" : "sign in"}.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eef4f1]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[linear-gradient(180deg,#004d40_0%,#00695c_54%,#0b8473_100%)] px-12 py-16 text-white lg:flex">
          <div className="relative z-10 m-auto max-w-lg text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/15 bg-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.18)] backdrop-blur">
              <MapPin className="h-10 w-10" />
            </div>
            <h1 className="mt-8 text-5xl font-bold leading-tight">E-waste Collector</h1>
            <p className="mt-4 text-2xl text-white/86">Schedule pickups, track collectors, and measure your recycling impact.</p>
          </div>
        </section>

        <section className="relative flex min-h-screen items-end justify-center px-4 pb-6 pt-[34vh] lg:items-center lg:px-8 lg:pb-8 lg:pt-8">
          <div className="absolute inset-x-0 top-0 h-[42vh] bg-[linear-gradient(180deg,#004d40_0%,#00695c_55%,#0b8473_100%)] lg:hidden">
            <div className="flex h-full flex-col items-center justify-start px-6 pt-12 text-center text-white">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                <MapPin className="h-8 w-8" />
              </div>
              <h1 className="mt-5 text-[clamp(2rem,7vw,2.75rem)] font-bold leading-none">E-waste Collector</h1>
              <p className="mt-3 max-w-[260px] text-sm leading-5 text-white/80">Your recycling activity, tracking, and impact in one place.</p>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-[520px] rounded-[28px] border border-white/70 bg-white/96 p-6 shadow-[0_24px_60px_rgba(20,37,34,0.12)] backdrop-blur lg:rounded-[24px] lg:p-10">
            <div>
              <h2 className="text-[30px] font-bold tracking-tight text-[#102422]">{mode === "signup" ? "Create account" : "Welcome back"}</h2>
              <p className="mt-2 text-[15px] text-[#69807a]">
                {mode === "signup"
                  ? "Create a local account on this device using your phone number."
                  : "Sign in locally using the phone number you registered with on this device."}
              </p>
            </div>

            <div className="mt-6 flex rounded-2xl bg-[#f5f8f7] p-1.5">
              {[
                { id: "signin", label: "Sign In" },
                { id: "signup", label: "Sign Up" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setMode(option.id as "signin" | "signup")}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    mode === option.id ? "bg-white text-[#102422] shadow-sm" : "text-[#69807a]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              {mode === "signup" ? (
                <label className="block">
                  <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#69807a]">Full name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="h-14 w-full rounded-xl border border-[#dce7e2] bg-[#fbfdfc] px-4 text-[15px] text-[#102422] outline-none" placeholder="Enter your name" />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#69807a]">Phone number</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-14 w-full rounded-xl border border-[#dce7e2] bg-[#fbfdfc] px-4 text-[15px] text-[#102422] outline-none" placeholder="+91 98xxxxxxx" />
              </label>
            </div>

            {mode === "signup" ? (
              <div className="mt-8">
                <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#69807a]">Language</div>
                <div className="flex flex-wrap gap-2 rounded-2xl bg-[#f5f8f7] p-1.5">
                  {languages.map((option) => (
                    <button key={option} onClick={() => setLanguage(option)} className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${language === option ? "bg-white text-[#102422] shadow-sm" : "text-[#69807a]"}`}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {error ? <div className="mt-4 rounded-xl bg-[#fff3f3] px-4 py-3 text-sm text-[#b34040]">{error}</div> : null}

            <button
              onClick={handleSubmit}
              disabled={submitting || !phone || (mode === "signup" && !name)}
              className="mt-8 h-14 w-full rounded-xl bg-[#00695c] text-[15px] font-bold text-white shadow-[0_16px_32px_rgba(0,105,92,0.2)] transition-colors hover:bg-[#00584d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (mode === "signup" ? "Creating account..." : "Signing in...") : mode === "signup" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
