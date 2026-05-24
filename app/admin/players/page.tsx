 "use client";

import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  display_name: string | null;
  paid_in: boolean;
};

export default function AdminPlayersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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

    const { data: profilesData, error } = await supabase
      .from("profiles")
      .select("id, display_name, paid_in")
      .order("display_name");

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setProfiles(profilesData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const togglePaidIn = async (profile: Profile) => {
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ paid_in: !profile.paid_in })
      .eq("id", profile.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setProfiles((previous) =>
      previous.map((item) =>
        item.id === profile.id
          ? { ...item, paid_in: !profile.paid_in }
          : item
      )
    );

    setMessage("Paid-in status updated.");
  };

  if (loading) {
    return <main className="p-4 sm:p-8">Loading...</main>;
  }

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50 p-4 sm:p-8">
          <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Admin - Players
            </h1>

            <p className="mt-4 font-medium text-red-700">
              You do not have permission to view this page.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50 p-4 sm:p-8">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Admin - Players
          </h1>

          <a
            href="/admin"
            className="mt-3 inline-block rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-900"
          >
            Back to admin
          </a>

          <p className="mt-4 text-sm font-medium text-slate-800">
            Tick players who have paid into the money pot.
          </p>

          {message && (
            <p className="mt-4 text-sm font-semibold text-slate-900">
              {message}
            </p>
          )}

          <div className="mt-6 space-y-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded-xl border border-slate-300 bg-white p-4 shadow-sm"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {profile.display_name || profile.id.slice(0, 6)}
                  </div>

                  <div className="text-xs font-medium text-slate-600">
                    {profile.id.slice(0, 8)}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <input
                    type="checkbox"
                    checked={profile.paid_in}
                    onChange={() => togglePaidIn(profile)}
                    className="h-5 w-5"
                  />
                  Paid in
                </label>
              </div>
            ))}
          </div>

          {profiles.length === 0 && (
            <p className="mt-4 text-sm font-medium text-slate-700">
              No player profiles found yet.
            </p>
          )}
        </div>
      </main>
    </>
  );
}