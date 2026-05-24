"use client";

import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Team = {
  id: string;
  name: string;
  flag_url: string | null;
};

type PickWindow = {
  id: string;
  name: string;
  window_type: string;
  round_name: string | null;
  california_date: string | null;
  lock_at: string;
  points: number;
  reuse_allowed: boolean;
  sort_order: number;
};

function getIsLocked(lockAt?: string) {
  if (!lockAt) return true;
  return new Date() >= new Date(lockAt);
}

export default function PickPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [pickWindows, setPickWindows] = useState<PickWindow[]>([]);
  const [currentWindow, setCurrentWindow] = useState<PickWindow | null>(null);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [currentPickName, setCurrentPickName] = useState("");
  const [pickHistory, setPickHistory] = useState<any[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState("");
  const [selectedWindowId, setSelectedWindowId] = useState("");
const [fixtures, setFixtures] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You need to log in first.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();

      setDisplayName(profile?.display_name || "");

      const { data: teamsData } = await supabase
        .from("teams")
        .select("*")
        .order("name");

      setTeams(teamsData || []);

      const { data: windowsData } = await supabase
        .from("pick_windows")
        .select("*")
        .order("sort_order");

      setPickWindows(windowsData || []);

      const nextWindow =
        (windowsData || []).find(
          (window) => new Date(window.lock_at) > new Date()
        ) || null;

      setCurrentWindow(nextWindow);
      setSelectedWindowId(nextWindow?.id || "");

const { data: fixturesData } = await supabase
  .from("fixtures")
  .select("*")
  .order("kickoff_at");

setFixtures(fixturesData || []);

      const { data: historyData } = await supabase
.from("game_picks")
.select("team_id, submitted_at, teams(name), pick_windows(id, name, points, lock_at, sort_order)")
        .eq("user_id", user.id);

      const sortedHistory = (historyData || []).sort(
        (a: any, b: any) =>
          (a.pick_windows?.sort_order || 0) -
          (b.pick_windows?.sort_order || 0)
      );

      setPickHistory(sortedHistory);

      if (nextWindow) {
        const { data: currentPick } = await supabase
          .from("game_picks")
          .select("team_id, teams(name)")
          .eq("user_id", user.id)
          .eq("pick_window_id", nextWindow.id)
          .maybeSingle();

        if (currentPick) {
          setSelectedTeam(currentPick.team_id);
          setCurrentPickName((currentPick.teams as any)?.name || "");
        }
      }
    }

    loadData();
  }, []);

useEffect(() => {
  const countdownWindow =
    pickWindows.find((window) => window.id === selectedWindowId) || null;

  if (!countdownWindow?.lock_at) {
    setCountdown("");
    return;
  }

  const updateCountdown = () => {
    const now = new Date().getTime();
    const lockTime = new Date(countdownWindow.lock_at).getTime();
    const difference = lockTime - now;

    if (difference <= 0) {
      setCountdown("Locked");
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
  };

  updateCountdown();

  const timer = setInterval(updateCountdown, 1000);

  return () => clearInterval(timer);
}, [selectedWindowId, pickWindows]);

  const saveDisplayName = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !displayName.trim()) return;

    await supabase.from("profiles").upsert({
      id: user.id,
      display_name: displayName.trim(),
    });

    setMessage("Name saved!");
  };

  const submitPick = async () => {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You need to log in first.");
      return;
    }

    if (!selectedWindow) {
      setMessage("No active pick window found.");
      return;
    }

    if (!selectedTeam) {
      setMessage("Please choose a team.");
      return;
    }

    if (new Date() >= new Date(selectedWindow.lock_at)) {
      setMessage("This pick window is locked.");
      return;
    }

    if (!selectedWindow.reuse_allowed) {
      const { data: previousSameTeamPick } = await supabase
        .from("game_picks")
        .select("id, pick_windows!inner(reuse_allowed)")
        .eq("user_id", user.id)
        .eq("team_id", selectedTeam)
        .neq("pick_window_id", selectedWindow.id)
        .eq("pick_windows.reuse_allowed", false)
        .maybeSingle();

      if (previousSameTeamPick) {
        setMessage(
          "You have already picked this team. Reuse is only allowed from the quarter-finals onward."
        );
        return;
      }
    }

    const { error } = await supabase.from("game_picks").upsert(
      {
        user_id: user.id,
        pick_window_id: selectedWindow.id,
        team_id: selectedTeam,
        submitted_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,pick_window_id",
      }
    );

    if (error) {
      setMessage(error.message);
      return;
    }

    const pickedTeam = teams.find((team) => team.id === selectedTeam);
    setCurrentPickName(pickedTeam?.name || "");

    setPickHistory((previous) => {
      const withoutCurrent = previous.filter(
        (pick) => pick.pick_windows?.name !== selectedWindow.name
      );

      return [
        ...withoutCurrent,
        {
          team_id: selectedTeam,
          teams: { name: pickedTeam?.name || "" },
          pick_windows: {
            name: selectedWindow.name,
            points: selectedWindow.points,
            lock_at: selectedWindow.lock_at,
            sort_order: selectedWindow.sort_order,
          },
        },
      ].sort(
        (a, b) =>
          (a.pick_windows?.sort_order || 0) -
          (b.pick_windows?.sort_order || 0)
      );
    });

    setMessage("Pick saved!");
  };

const selectedWindow =
  pickWindows.find((window) => window.id === selectedWindowId) ||
  currentWindow;

const fixturesForSelectedWindow = fixtures.filter((fixture) => {
  if (!selectedWindow) return false;

  if (selectedWindow.window_type === "group_day") {
    return fixture.pick_window_id === selectedWindow.id;
  }

  return fixture.round_name === selectedWindow.round_name;
});

const teamOptionsForSelectedWindow = fixturesForSelectedWindow.flatMap(
  (fixture) => {
    const home = fixture.home_team_id
      ? {
          id: fixture.home_team_id,
          name: fixture.home_team,
          opponent: fixture.away_team || fixture.away_placeholder || "TBD",
        }
      : null;

    const away = fixture.away_team_id
      ? {
          id: fixture.away_team_id,
          name: fixture.away_team,
          opponent: fixture.home_team || fixture.home_placeholder || "TBD",
        }
      : null;

    return [home, away].filter(Boolean);
  }
);


const selectedLockAt = selectedWindow?.lock_at;

const isLocked = getIsLocked(selectedWindow?.lock_at);

 const usedTeamIdsBeforeReuse = pickHistory
  .filter((pick) => {
    const window = pick.pick_windows;
    if (!window) return false;

    const matchingWindow = pickWindows.find((w) => w.name === window.name);

    return matchingWindow && !matchingWindow.reuse_allowed;
  })
  .map((pick) => pick.team_id);

const availableTeams = teamOptionsForSelectedWindow.filter((team: any) => {
  if (!selectedWindow) return false;
  if (selectedWindow.reuse_allowed) return true;

  return !usedTeamIdsBeforeReuse.includes(team.id) || team.id === selectedTeam;
});


const getPickResult = (pick: any) => {
  const windowFixtures = fixtures.filter(
    (fixture) => fixture.pick_window_id === pick.pick_windows?.id
  );

  if (windowFixtures.length === 0) {
    return { points: "-", status: "pending" };
  }

  const resolvedFixtures = windowFixtures.filter((fixture) => {
    if (fixture.match_number <= 72) {
      return fixture.home_score !== null && fixture.away_score !== null;
    }

    return !!fixture.winner_team_id;
  });

  if (resolvedFixtures.length === 0) {
    return { points: "-", status: "pending" };
  }

  const pickedTeamWon = resolvedFixtures.some((fixture) => {
    if (fixture.match_number <= 72) {
      if (fixture.home_score === fixture.away_score) return false;

      const winningTeamId =
        fixture.home_score > fixture.away_score
          ? fixture.home_team_id
          : fixture.away_team_id;

      return winningTeamId === pick.team_id;
    }

    return fixture.winner_team_id === pick.team_id;
  });

  if (pickedTeamWon) {
    return {
      points: pick.pick_windows?.points || 0,
      status: "correct",
    };
  }

  return { points: 0, status: "wrong" };
};

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50 p-4 sm:p-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur">
          <div className="rounded-2xl bg-gradient-to-r from-blue-950/95 to-emerald-700/90 p-6 text-white shadow-xl">
  <h1 className="text-3xl font-bold text-slate-900">World Cup Predictor</h1>
  <p className="mt-2 text-blue-100">
    Pick winners. Score points. Climb the leaderboard.
  </p>
</div>

          <div className="mt-3 flex gap-3">
            <a
              href="/rules"
              className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-900"
            >
              View rules
            </a>

            <a
              href="/leaderboard"
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-800"
            >
              View leaderboard
            </a>
          </div>

          <div className="mt-6">
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <button
              onClick={saveDisplayName}
              className="mt-2 w-full rounded bg-slate-700 p-2 text-white"
            >
              Save Name
            </button>
          </div>

          {currentWindow ? (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-md">

              <select
  className="mb-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
  value={selectedWindowId}
  onChange={(e) => {
    setSelectedWindowId(e.target.value);
    setSelectedTeam("");
    setCurrentPickName("");
  }}
>
  {pickWindows
    .filter((window) => new Date(window.lock_at) > new Date())
    .map((window) => (
      <option key={window.id} value={window.id}>
        {window.name}
      </option>
    ))}
</select>
              <h2 className="text-2xl font-extrabold text-slate-900">
  {selectedWindow?.name}
</h2>

              <p className="mt-3 rounded-xl bg-blue-50 p-4 text-sm font-semibold leading-7 text-slate-900">
                Points available: <strong>{selectedWindow?.points}</strong>
                <br />
                Lock time:{" "}
                {selectedWindow?.lock_at
  ? new Date(selectedWindow.lock_at).toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      dateStyle: "medium",
      timeStyle: "short",
    })
  : "No deadline"}
                
                {" "}
                Pacific
                <br />
                
                UTC deadline:{" "}
{selectedWindow?.lock_at
  ? new Date(selectedWindow.lock_at).toUTCString()
  : "No deadline"}

                <br />
                Time remaining: <strong>{countdown}</strong>
              </p>

              {!selectedWindow?.reuse_allowed && (
                <p className="mt-3 text-sm font-medium text-slate-800">
                  Reuse rule: you cannot pick a team you have already used.
                </p>
              )}

              {selectedWindow?.reuse_allowed && (
                <p className="mt-3 text-sm font-medium text-slate-800">
                  Reuse rule lifted: teams may be picked again from this round
                  onward.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50 p-4">
              No active pick window found.
            </div>
          )}

          {currentPickName && (
            <p className="mt-4 rounded bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50 p-3 text-sm">
              Current pick: <strong>{currentPickName}</strong>
            </p>
          )}

          <select
            disabled={isLocked || !currentWindow}
            className="mt-6 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="">Choose a team</option>

            {availableTeams.map((team: any) => (
  <option key={`${team.id}-${team.opponent}`} value={team.id}>
    {team.name} (vs {team.opponent})
  </option>
))}
          </select>

          <button
            disabled={isLocked || !currentWindow}
            onClick={submitPick}
            className="mt-4 w-full rounded bg-black p-2 text-white disabled:bg-slate-400"
          >
            Submit Pick
          </button>

          {message && <p className="mt-4 text-sm">{message}</p>}

          {pickHistory.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold">Your Picks</h2>

              <table className="mt-3 w-full text-sm border">
                <thead>
                  <tr className="bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50">
                    <th className="p-2 text-left">Window</th>
                    <th className="p-2 text-left">Pick</th>
                    <th className="p-2 text-left">Points</th>
                  </tr>
                </thead>

                <tbody>
                  {pickHistory.map((pick, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{pick.pick_windows?.name}</td>
                      <td className="p-2"><div className="flex items-center gap-2">
  <img
    src={
      teams.find((team) => team.id === pick.team_id)?.flag_url || ""
    }
    alt=""
    className="h-4 w-6 object-cover"
  />

  <span>{pick.teams?.name}</span>
</div>
</td>
                      <td
  className={`p-2 font-semibold ${
    getPickResult(pick).status === "correct"
      ? "text-green-700"
      : getPickResult(pick).status === "wrong"
      ? "text-red-700"
      : "text-slate-500"
  }`}
>
  {getPickResult(pick).points}
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}