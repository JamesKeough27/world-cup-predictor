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
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-slate-900">World Cup Pool Login</h1>

        <input
          className="mt-4 w-full border p-2"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
  className="mt-4 w-full border p-2"
  placeholder="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

        <button
          onClick={login}
          className="mt-4 w-full rounded bg-black p-2 text-white"
        >
          Login
        </button>

        <button
  onClick={signUp}
  className="mt-2 w-full rounded bg-slate-700 p-2 text-white"
>
  Sign Up
</button>

<button
  onClick={resetPassword}
  className="mt-2 w-full rounded bg-slate-200 p-2 text-slate-800"
>
  Forgot password?
</button>

        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </main>
  );
}