"use client";

import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function getPickResult(pick: any, fixtures: any[]) {
  const windowFixtures = fixtures.filter(
    (fixture) => fixture.pick_window_id === pick.pick_window_id
  );

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
}

function buildLeaderboardRows({
  picks,
  profiles,
  fixtures,
}: {
  picks: any[];
  profiles: any[];
  fixtures: any[];
}) {
  const users = Array.from(new Set(picks.map((pick) => pick.user_id)));

  return users
    .map((userId) => {
      const userPicks = picks.filter((pick) => pick.user_id === userId);

      const results = userPicks.map((pick) => getPickResult(pick, fixtures));

      const totalPoints = results.reduce((sum, result) => {
        return typeof result.points === "number" ? sum + result.points : sum;
      }, 0);

      const resolvedPicks = results.filter(
        (result) => result.status !== "pending"
      );

      const correctPicks = results.filter(
        (result) => result.status === "correct"
      );

      const winPercentage =
        resolvedPicks.length > 0
          ? Math.round((correctPicks.length / resolvedPicks.length) * 100)
          : 0;

      const visiblePicks = userPicks.filter((pick) => {
  const lockAt = pick.pick_windows?.lock_at;
  return lockAt && new Date(lockAt) <= new Date();
});

const latestPick = [...visiblePicks].sort(
  (a, b) =>
    (b.pick_windows?.sort_order || 0) -
    (a.pick_windows?.sort_order || 0)
)[0];

      const profile = profiles.find((profile) => profile.id === userId);

      return {
        userId,
        name: profile?.display_name || userId.slice(0, 6),
        paidIn: profile?.paid_in || false,
        totalPoints,
        correct: correctPicks.length,
        resolved: resolvedPicks.length,
        winPercentage,
        latestPick: latestPick?.teams?.name || "-",
      };
    })
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }

      if (b.winPercentage !== a.winPercentage) {
        return b.winPercentage - a.winPercentage;
      }

      return a.name.localeCompare(b.name);
    });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function LeaderboardPage() {
  const [picks, setPicks] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    async function loadLeaderboard() {
      const { data: picksData } = await supabase
        .from("game_picks")
        .select(
          "user_id, pick_window_id, team_id, teams(name), pick_windows(name, points, sort_order, lock_at)"
        );

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name, paid_in");

      const { data: fixturesData } = await supabase
        .from("fixtures")
        .select(
          "pick_window_id, match_number, home_score, away_score, home_team_id, away_team_id, winner_team_id"
        );

const { data: teamsData } = await supabase
  .from("teams")
  .select("id, name, flag_url");

      setPicks(picksData || []);
      setProfiles(profilesData || []);
      setFixtures(fixturesData || []);
      setTeams(teamsData || []);
    }

    loadLeaderboard();
  }, []);

  const rows = buildLeaderboardRows({
    picks,
    profiles,
    fixtures,
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[url('/celebration.png')] bg-cover bg-center bg-fixed p-4 sm:p-8">
      <div className="min-h-screen bg-black/40">
        <div className="mx-auto w-full max-w-5xl rounded-2xl bg-white p-6 shadow-xl backdrop-blur">
          <h1 className="text-3xl font-bold text-slate-900">Leaderboard</h1>

          <a
            href="/pick"
            className="mt-3 inline-block rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-900"
          >
            Back to picks
          </a>

          <div className="mt-6 overflow-x-auto">
  <table className="min-w-[700px] w-full overflow-hidden rounded-2xl border border-slate-300 bg-white text-sm shadow-sm">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="p-3 text-left text-sm font-bold">Rank</th>
                <th className="p-3 text-left text-sm font-bold">Player</th>
                <th className="p-3 text-left text-sm font-bold">Points</th>
                <th className="p-3 text-left text-sm font-bold">Correct</th>
                <th className="p-3 text-left text-sm font-bold">Matches Played</th>
                <th className="p-3 text-left text-sm font-bold">Win %</th>
                <th className="p-3 text-left text-sm font-bold">Latest Pick</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((player, index) => (
                <tr key={player.userId} className="border-t hover:bg-slate-50">
                  <td className="p-3 font-bold">
  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
</td>
                  <td className="p-3">
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
      {getInitials(player.name)}
    </div>

    <div>
      
<div className="flex items-center gap-2">
  <span className="text-base font-bold text-slate-900">
    {player.name}
  </span>

  {player.paidIn && (
    <span
      title="Money pot participant"
      className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-800"
    >
      💰 Pot
    </span>
  )}
</div>

      <div className="text-xs font-medium text-slate-700">
        {player.correct}/{player.resolved} correct
      </div>
    </div>
  </div>
</td>
                  <td className="p-3">
  <span className="rounded-full bg-yellow-100 px-3 py-1 font-bold text-yellow-800">
    {player.totalPoints} pts
  </span>
</td>
                  <td className="p-3 font-medium text-slate-900">{player.correct}</td>
                  <td className="p-3 font-medium text-slate-900">{player.resolved}</td>
                  <td className="p-3 font-medium text-slate-900">{player.winPercentage}%</td>
                  
<td className="p-3 font-medium text-slate-900">
  {player.latestPick === "-" ? (
    <span>-</span>
  ) : (
    <div className="flex items-center gap-2">
      {teams.find((team) => team.name === player.latestPick)?.flag_url && (
        <img
          src={teams.find((team) => team.name === player.latestPick)?.flag_url}
          alt=""
          className="h-4 w-6 object-cover"
        />
      )}

      <span>{player.latestPick}</span>
    </div>
  )}
</td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
          {rows.length === 0 && (
            <p className="mt-4 text-sm text-slate-600">
              No picks have been submitted yet.
            </p>
          )}
        </div>
        </div>
      </main>
    </>
  );
}