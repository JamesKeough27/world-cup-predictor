"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  useEffect(() => {
  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      window.location.href = "/pick";
    }
  }

  checkUser();
}, []);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

 const [password, setPassword] = useState("");

const login = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setMessage(error.message);
    return;
  }

  window.location.href = "/pick";
};

const signUp = async () => {
  setMessage("");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    setMessage(error.message);
    return;
  }

  if (data.user && data.user.identities?.length === 0) {
    setMessage("An account already exists for this email. Please log in instead.");
    return;
  }

  setMessage("Account created. You can now log in.");
};

const resetPassword = async () => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage("Password reset email sent.");
};

  return (
  <main className="min-h-screen bg-[url('/World-Cup-Trophy.png')] bg-cover bg-center bg-fixed p-4 sm:p-8">
    <div className="flex min-h-screen items-center justify-center bg-black/35">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-white/30">
        <div className="text-center">
          <div className="text-5xl">🏆</div>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
            World Cup Predictor
          </h1>

          <p className="mt-3 text-base font-semibold text-slate-700">
            Pick winners. Score points. Climb the leaderboard.
          </p>

          <div className="mt-4 text-2xl tracking-wide">
            🇺🇸 🇲🇽 🇨🇦 🇧🇷 🇦🇷 🇫🇷 🇪🇸 🇩🇪
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-blue-50 p-4">
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="mt-4 w-full rounded-xl bg-blue-800 px-4 py-3 font-bold text-white shadow hover:bg-blue-900"
          >
            Log in
          </button>

          <button
            onClick={signUp}
            className="mt-3 w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white shadow hover:bg-emerald-800"
          >
            Create account
          </button>

          <button
            onClick={resetPassword}
            className="mt-3 w-full rounded-xl bg-slate-800 px-4 py-3 font-bold text-white shadow hover:bg-slate-900"
          >
            Forgot password?
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-xl bg-yellow-50 p-3 text-sm font-semibold text-slate-900">
            {message}
          </p>
        )}
      </div>
    </div>
  </main>
);
}