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

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Survivor Pool Login</h1>

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

        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </main>
  );
}