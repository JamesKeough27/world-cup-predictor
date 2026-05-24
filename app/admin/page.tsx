"use client";



import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [rounds, setRounds] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

const clearFuturePicks = async () => {
  setMessage("");

  const { data: futureWindows, error: windowsError } = await supabase
    .from("pick_windows")
    .select("id")
    .gt("lock_at", new Date().toISOString());

  if (windowsError) {
    setMessage(windowsError.message);
    return;
  }

  const futureWindowIds = (futureWindows || []).map((window) => window.id);

  if (futureWindowIds.length === 0) {
    setMessage("No future pick windows to clear.");
    return;
  }

  const { error } = await supabase
    .from("game_picks")
    .delete()
    .in("pick_window_id", futureWindowIds);

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage("All future picks have been cleared.");
};

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!adminRow) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      const { data: roundsData } = await supabase
        .from("rounds")
        .select("*")
        .order("lock_at");

      const { data: teamsData } = await supabase
        .from("teams")
        .select("*")
        .order("name");

      const { data: resultsData } = await supabase
        .from("results")
        .select("*")
        .eq("result", "win");

      setRounds(roundsData || []);
      setTeams(teamsData || []);
      setResults(resultsData || []);
      setLoading(false);
    }

    loadData();
  }, []);

 

  if (loading) {
    return <main className="p-4 sm:p-8">Loading...</main>;
  }

  if (!isAdmin) {
    return (
        <>
        <Navbar />

      <main className="min-h-screen bg-slate-100 p-4 sm:p-8">
        <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
          <p className="mt-4 text-red-700">
            You do not have permission to view this page.
          </p>
          <a href="/pick" className="mt-4 inline-block underline">
            Back to picks
          </a>
                  </div>
      </main>
      </>
    );
  }

  return (
    <>
        <Navbar />
    <main className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Admin</h1>

<div className="mt-4 flex flex-col gap-3">
  <a
    href="/admin/fixtures"
    className="rounded bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300"
  >
    Manage fixtures
  </a>

  <a
    href="/admin/groups"
    className="rounded bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300"
  >
    Manage group standings
  </a>

<button
  onClick={() => {
    if (
      confirm(
        "This will delete all picks for windows whose deadline has not passed. Continue?"
      )
    ) {
      clearFuturePicks();
    }
  }}
  className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
>
  Clear all future picks
</button>

</div>

        <a href="/pick" className="mt-2 inline-block text-sm underline">
          Back to picks
        </a>



        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>

      
    </main>
    </>
  );
}