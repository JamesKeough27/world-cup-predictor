"use client";

import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
<div className="w-full bg-gradient-to-r from-blue-950 via-blue-800 to-emerald-700 text-white shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-bold">World Cup 2026 Pool</div>

        <div className="flex flex-wrap gap-3 text-sm">
          <a href="/pick" className="hover:text-yellow-300">Picks</a>
          <a href="/rules" className="hover:text-yellow-300">Rules</a>
          <a href="/leaderboard" className="hover:text-yellow-300">
  Leaderboard
</a>
<a href="/fixtures" className="hover:text-yellow-300">
  Fixtures
</a>
          <a href="/admin" className="hover:text-yellow-300">Admin</a>
          <button onClick={logout} className="hover:text-yellow-300">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}