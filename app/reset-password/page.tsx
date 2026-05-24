"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const updatePassword = async () => {
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated. You can now log in.");

    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50 p-8">
      <div className="mx-auto max-w-md rounded-2xl bg-white/95 p-6 shadow-xl">
        <h1 className="text-2xl font-bold">Reset Password</h1>

        <input
          className="mt-4 w-full border p-2"
          placeholder="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={updatePassword}
          className="mt-4 w-full rounded bg-black p-2 text-white"
        >
          Update Password
        </button>

        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </main>
  );
}