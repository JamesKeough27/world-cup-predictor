"use client";

import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProtectedPage from "@/components/protected-page";

type Team = {
  id: string;
  name: string;
};

type Fixture = {
  id: string;
  match_number: number;
  round_name: string;
  group_name: string | null;
  kickoff_at: string;
  home_team: string | null;
  away_team: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  home_placeholder: string | null;
  away_placeholder: string | null;
  home_score: number | null;
  away_score: number | null;
  winner_team_id: string | null;
  home_source_match_number: number | null;
  home_source_type: string | null;
  away_source_match_number: number | null;
  away_source_type: string | null;
};

export default function AdminFixturesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
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

    const { data: fixturesData } = await supabase
      .from("fixtures")
      .select("*")
      .order("kickoff_at", { ascending: true });

    const { data: teamsData } = await supabase
      .from("teams")
      .select("*")
      .order("name");

    setFixtures(fixturesData || []);
    setTeams(teamsData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

const clearHomeTeam = async (fixtureId: string) => {
  await updateFixture(fixtureId, {
    home_team_id: null,
    home_team: null,
  });
};

const clearAwayTeam = async (fixtureId: string) => {
  await updateFixture(fixtureId, {
    away_team_id: null,
    away_team: null,
  });
};


const updateFixture = async (
  fixtureId: string,
  updates: Partial<Fixture>
) => {
  setMessage("");

const clearWinner = async (fixture: Fixture) => {
  setMessage("");

  const { error } = await supabase
    .from("fixtures")
    .update({
      winner_team_id: null,
    })
    .eq("id", fixture.id);

  if (error) {
    setMessage(error.message);
    return;
  }

  await supabase
    .from("fixtures")
    .update({
      home_team_id: null,
      home_team: null,
    })
    .eq("home_source_match_number", fixture.match_number)
    .eq("home_source_type", "winner");

  await supabase
    .from("fixtures")
    .update({
      away_team_id: null,
      away_team: null,
    })
    .eq("away_source_match_number", fixture.match_number)
    .eq("away_source_type", "winner");

    await supabase
  .from("fixtures")
  .update({
    home_team_id: null,
    home_team: null,
  })
  .eq("home_source_match_number", fixture.match_number)
  .eq("home_source_type", "loser");

await supabase
  .from("fixtures")
  .update({
    away_team_id: null,
    away_team: null,
  })
  .eq("away_source_match_number", fixture.match_number)
  .eq("away_source_type", "loser");

  await loadData();

  setMessage("Winner cleared and downstream fixture reset.");
};

  const { error } = await supabase
    .from("fixtures")
    .update(updates)
    .eq("id", fixtureId);

  if (error) {
    setMessage(error.message);
    return;
  }

  const updatedFixture = fixtures.find((fixture) => fixture.id === fixtureId);

  setFixtures((previous) =>
    previous.map((fixture) =>
      fixture.id === fixtureId ? { ...fixture, ...updates } : fixture
    )
  );

  if (updates.winner_team_id && updatedFixture?.match_number) {
    const winnerTeam = teams.find((team) => team.id === updates.winner_team_id);

    if (winnerTeam) {
      await supabase
        .from("fixtures")
        .update({
          home_team_id: winnerTeam.id,
          home_team: winnerTeam.name,
        })
        .eq("home_source_match_number", updatedFixture.match_number)
        .eq("home_source_type", "winner");

      await supabase
        .from("fixtures")
        .update({
          away_team_id: winnerTeam.id,
          away_team: winnerTeam.name,
        })
        .eq("away_source_match_number", updatedFixture.match_number)
        .eq("away_source_type", "winner");
    }

const homeLost =
  updatedFixture.home_team_id &&
  updatedFixture.home_team_id !== updates.winner_team_id;

const awayLost =
  updatedFixture.away_team_id &&
  updatedFixture.away_team_id !== updates.winner_team_id;

const loserTeam = homeLost
  ? teams.find((team) => team.id === updatedFixture.home_team_id)
  : awayLost
  ? teams.find((team) => team.id === updatedFixture.away_team_id)
  : null;

if (loserTeam) {
  await supabase
    .from("fixtures")
    .update({
      home_team_id: loserTeam.id,
      home_team: loserTeam.name,
    })
    .eq("home_source_match_number", updatedFixture.match_number)
    .eq("home_source_type", "loser");

  await supabase
    .from("fixtures")
    .update({
      away_team_id: loserTeam.id,
      away_team: loserTeam.name,
    })
    .eq("away_source_match_number", updatedFixture.match_number)
    .eq("away_source_type", "loser");
}

    await loadData();
  }

  setMessage("Fixture updated.");

};

const clearWinner = async (fixture: Fixture) => {
  setMessage("");

  const { error } = await supabase
    .from("fixtures")
    .update({
      winner_team_id: null,
    })
    .eq("id", fixture.id);

  if (error) {
    setMessage(error.message);
    return;
  }

  await supabase
    .from("fixtures")
    .update({
      home_team_id: null,
      home_team: null,
    })
    .eq("home_source_match_number", fixture.match_number)
    .eq("home_source_type", "winner");

  await supabase
    .from("fixtures")
    .update({
      away_team_id: null,
      away_team: null,
    })
    .eq("away_source_match_number", fixture.match_number)
    .eq("away_source_type", "winner");

  await loadData();

  setMessage("Winner cleared.");
};

const clearAllKnockoutWinners = async () => {
  setMessage("");

  const { error } = await supabase
    .from("fixtures")
    .update({
      winner_team_id: null,
      home_score: null,
      away_score: null,
    })
    .gte("match_number", 73)
    .lte("match_number", 104);

  if (error) {
    setMessage(error.message);
    return;
  }

  await supabase
    .from("fixtures")
    .update({
      home_team_id: null,
      home_team: null,
      away_team_id: null,
      away_team: null,
    })
    .gte("match_number", 89)
    .lte("match_number", 104);

  await loadData();

  setMessage("All knockout winners and propagated teams cleared.");
};

const jumpToNextBlankResult = () => {
  const nextBlank = fixtures.find((fixture) => {
    const hasScores =
      fixture.home_score !== null && fixture.away_score !== null;

    const needsWinner = fixture.match_number >= 73;
    const hasWinner = !!fixture.winner_team_id;

    return !hasScores || (needsWinner && !hasWinner);
  });

  if (!nextBlank) {
    setMessage("No blank results found.");
    return;
  }

  document
    .getElementById(`fixture-${nextBlank.id}`)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
};


  if (loading) {
    return <main className="p-4 sm:p-8">Loading...</main>;
  }

  if (!isAdmin) {



    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-100 p-4 sm:p-8">
          <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
            <h1 id="top"className="text-3xl font-bold text-slate-900">Admin Fixtures</h1>
            <p className="mt-4 text-red-700">
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
      <main className="min-h-screen bg-slate-100 p-4 sm:p-8">
        <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow">
          <h1 id="top" className="text-3xl font-extrabold text-slate-900">
  Admin - Fixtures
</h1>

          <a
            href="/admin"
            className="mt-3 inline-block rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-900"
          >
            Back to admin
          </a>

<button
  onClick={clearAllKnockoutWinners}
  className="mt-3 rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
>
  Clear all knockout winners
</button>

<div className="mt-3 flex flex-wrap gap-2">
  <button
    onClick={jumpToNextBlankResult}
    className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-800"
  >
    Jump to next blank result
  </button>

</div>

          {message && <p className="mt-4 text-sm font-medium text-slate-900">{message}</p>}

          <div className="mt-6 space-y-6">
            {fixtures.map((fixture) => {
              const homeLabel =
                fixture.home_team || fixture.home_placeholder || "TBD";
              const awayLabel =
                fixture.away_team || fixture.away_placeholder || "TBD";
const isGroupStage = fixture.match_number <= 72;
              return (
                <div
  id={`fixture-${fixture.id}`}
  key={fixture.id}
  className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm"
>
                  <div className="text-lg font-bold text-slate-900">
                    Match {fixture.match_number}: {homeLabel} vs {awayLabel}
                  </div>

                  <div className="mt-1 text-sm font-medium text-slate-800">
                    {fixture.round_name}{" "}
                    {fixture.group_name ? `• ${fixture.group_name}` : ""}
                  </div>

<div className="mt-4 rounded-xl border border-slate-200 bg-blue-50 p-4 text-sm font-medium text-slate-900">
  <div>
    <strong>Home:</strong>{" "}
    {fixture.home_team || fixture.home_placeholder || "TBD"}
  </div>
  <div className="mt-1">
    <strong>Away:</strong>{" "}
    {fixture.away_team || fixture.away_placeholder || "TBD"}
  </div>
</div>
<div className={`mt-4 grid gap-3 ${isGroupStage ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
  <input
    className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
    placeholder="Home score"
    type="number"
    value={fixture.home_score ?? ""}
    onChange={(e) =>
      updateFixture(fixture.id, {
        home_score: e.target.value === "" ? null : Number(e.target.value),
      })
    }
  />

  <input
    className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
    placeholder="Away score"
    type="number"
    value={fixture.away_score ?? ""}
    onChange={(e) =>
      updateFixture(fixture.id, {
        away_score: e.target.value === "" ? null : Number(e.target.value),
      })
    }
  />

  {!isGroupStage && (
  <div>
    <select
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
      value={fixture.winner_team_id ?? "__none__"}
      onChange={(e) =>
        updateFixture(fixture.id, {
          winner_team_id:
            e.target.value === "__none__" ? null : e.target.value,
        })
      }
    >
      <option value="__none__">Winner / TBD</option>

      {fixture.home_team_id && (
        <option value={fixture.home_team_id}>
          {fixture.home_team}
        </option>
      )}

      {fixture.away_team_id && (
        <option value={fixture.away_team_id}>
          {fixture.away_team}
        </option>
      )}
    </select>

    <button
      onClick={() => clearWinner(fixture)}
      className="mt-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900"
    >
      Clear winner
    </button>
  </div>
)}
</div>


                </div>
              );
            })}
          </div>
        </div>

        <a
  href="#top"
  className="fixed bottom-4 right-4 rounded-full bg-blue-800 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-900"
>
  ↑ Top
</a>
      </main>
    </>
  );
}