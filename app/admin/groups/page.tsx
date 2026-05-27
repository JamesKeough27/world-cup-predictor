"use client";

import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProtectedPage from "@/components/protected-page";

const GROUPS = [
  "Group A",
  "Group B",
  "Group C",
  "Group D",
  "Group E",
  "Group F",
  "Group G",
  "Group H",
  "Group I",
  "Group J",
  "Group K",
  "Group L",
];



function parseGroupPlaceholder(placeholder: string | null) {
  if (!placeholder) return null;

  const normalized = placeholder.toLowerCase();

  const groupMatch = normalized.match(/group\s+([a-l])/i);
  if (!groupMatch) return null;

  const groupName = `Group ${groupMatch[1].toUpperCase()}`;

  if (
    normalized.includes("winner") ||
    normalized.includes("winners") ||
    normalized.includes("1st")
  ) {
    return { groupName, position: 1 };
  }

  if (
    normalized.includes("runner-up") ||
    normalized.includes("runner up") ||
    normalized.includes("runners-up") ||
    normalized.includes("runners up") ||
    normalized.includes("2nd")
  ) {
    return { groupName, position: 2 };
  }

  if (
    normalized.includes("third") ||
    normalized.includes("3rd")
  ) {
    return { groupName, position: 3 };
  }

  return null;
}



export default function AdminGroupsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("Group A");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [thirdPlaceSlots, setThirdPlaceSlots] = useState<any[]>([]);

const resolveRoundOf32 = async () => {
  setMessage("");

  const { data: fixturesData, error } = await supabase
    .from("fixtures")
    .select("*")
    .gte("match_number", 73)
    .lte("match_number", 88);

  if (error) {
    setMessage(error.message);
    return;
  }

  for (const fixture of fixturesData || []) {
    const homeRule = parseGroupPlaceholder(fixture.home_placeholder);
    const awayRule = parseGroupPlaceholder(fixture.away_placeholder);

    const updates: any = {};

    if (homeRule) {
      const homeStanding = standings.find(
        (row) =>
          row.group_name === homeRule.groupName &&
          row.position === homeRule.position
      );

      const homeTeam = homeStanding
        ? teams.find((team) => team.id === homeStanding.team_id)
        : null;

      updates.home_team_id = homeTeam?.id || null;
      updates.home_team = homeTeam?.name || null;
    }

    if (awayRule) {
      const awayStanding = standings.find(
        (row) =>
          row.group_name === awayRule.groupName &&
          row.position === awayRule.position
      );

      const awayTeam = awayStanding
        ? teams.find((team) => team.id === awayStanding.team_id)
        : null;

      updates.away_team_id = awayTeam?.id || null;
      updates.away_team = awayTeam?.name || null;
    }
const homeThirdPlaceSlot = thirdPlaceSlots.find(
  (slot) =>
    slot.fixture_match_number === fixture.match_number &&
    slot.side === "home"
);

const awayThirdPlaceSlot = thirdPlaceSlots.find(
  (slot) =>
    slot.fixture_match_number === fixture.match_number &&
    slot.side === "away"
);

if (homeThirdPlaceSlot?.team_id) {
  const homeTeam = teams.find((team) => team.id === homeThirdPlaceSlot.team_id);

  updates.home_team_id = homeTeam?.id || null;
  updates.home_team = homeTeam?.name || null;
}

if (awayThirdPlaceSlot?.team_id) {
  const awayTeam = teams.find((team) => team.id === awayThirdPlaceSlot.team_id);

  updates.away_team_id = awayTeam?.id || null;
  updates.away_team = awayTeam?.name || null;
}
    if (Object.keys(updates).length > 0) {
      await supabase.from("fixtures").update(updates).eq("id", fixture.id);
    }
  }

  setMessage("Round of 32 bracket resolved from group standings.");
};

const clearRoundOf32 = async () => {
  const { error } = await supabase
    .from("fixtures")
    .update({
      home_team_id: null,
      home_team: null,
      away_team_id: null,
      away_team: null,
      winner_team_id: null,
      home_score: null,
      away_score: null,
    })
    .gte("match_number", 73)
    .lte("match_number", 88);

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage("Round of 32 reset to placeholders.");
};

const getThirdPlacedTeamsForPlaceholder = (placeholder: string) => {
  const groupLetters = placeholder.match(/Group ([A-L/]+)/)?.[1]?.split("/") || [];

  const allowedGroups = groupLetters.map((letter) => `Group ${letter}`);

  return standings
    .filter(
      (row) =>
        allowedGroups.includes(row.group_name) &&
        row.position === 3
    )
    .map((row) => teams.find((team) => team.id === row.team_id))
    .filter(Boolean);
};

const selectedThirdPlaceTeamIds = thirdPlaceSlots
  .map((slot) => slot.team_id)
  .filter(Boolean);

const saveThirdPlaceSlot = async (slot: any, teamId: string) => {
  setMessage("");

  if (!teamId) {
    const { data, error } = await supabase
      .from("third_place_slots")
      .update({ team_id: null })
      .eq("id", slot.id)
      .select()
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setThirdPlaceSlots((previous) =>
      previous.map((item) => (item.id === slot.id ? data : item))
    );

    setMessage("Third-place slot cleared.");
    return;
  }

  const { data, error } = await supabase
    .from("third_place_slots")
    .update({ team_id: teamId })
    .eq("id", slot.id)
    .select()
    .single();

  if (error) {
    setMessage(error.message);
    return;
  }

  setThirdPlaceSlots((previous) =>
    previous.map((item) => (item.id === slot.id ? data : item))
  );

  setMessage("Third-place slot saved.");
};

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

    const { data: teamsData } = await supabase
      .from("teams")
      .select("*")
      .order("name");

    const { data: standingsData } = await supabase
      .from("group_standings")
      .select("*");

const { data: thirdPlaceSlotsData } = await supabase
  .from("third_place_slots")
  .select("*")
  .order("fixture_match_number");

setThirdPlaceSlots(thirdPlaceSlotsData || []);

const { data: fixturesData } = await supabase
  .from("fixtures")
  .select("group_name, home_team, away_team")
  .lte("match_number", 72);

setFixtures(fixturesData || []);

    setTeams(teamsData || []);
    setStandings(standingsData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

const teamsInSelectedGroup = Array.from(
  new Set(
    fixtures
      .filter((fixture) => fixture.group_name === selectedGroup)
      .flatMap((fixture) => [fixture.home_team, fixture.away_team])
      .filter(Boolean)
  )
)
  .map((teamName) => teams.find((team) => team.name === teamName))
  .filter(Boolean);

  const getTeamForPosition = (position: number) => {
    return (
      standings.find(
        (row) => row.group_name === selectedGroup && row.position === position
      )?.team_id || ""
    );
  };

  const savePosition = async (position: number, teamId: string) => {
    setMessage("");

    if (!teamId) {
  const { error } = await supabase
    .from("group_standings")
    .delete()
    .eq("group_name", selectedGroup)
    .eq("position", position);

  if (error) {
    setMessage(error.message);
    return;
  }

  setStandings((previous) =>
    previous.filter(
      (row) =>
        !(row.group_name === selectedGroup && row.position === position)
    )
  );

  setMessage("Standing cleared.");
  return;
}

    const { data, error } = await supabase
      .from("group_standings")
      .upsert(
        {
          group_name: selectedGroup,
          position,
          team_id: teamId,
        },
        {
          onConflict: "group_name,position",
        }
      )
      .select()
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setStandings((previous) => {
      const withoutCurrent = previous.filter(
        (row) =>
          !(row.group_name === selectedGroup && row.position === position)
      );

      return [...withoutCurrent, data];
    });

    setMessage("Standing saved.");
  };

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50 p-8">
          <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
            <h1 className="text-2xl font-bold text-slate-900">Admin Groups</h1>
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
      <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50 p-8">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
          <h1 className="text-3xl font-extrabold text-slate-900">Admin - Group Standings</h1>

          <a
            href="/admin"
            className="mt-3 inline-block rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-900"
          >
            Back to admin
          </a>

          <select
            className="mt-6 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          <button
  onClick={resolveRoundOf32}
  className="mt-4 w-full rounded bg-black p-2 text-white"
>
  Resolve Round of 32 from standings
</button>

<button
  onClick={clearRoundOf32}
  className="mt-2 w-full rounded bg-red-600 p-2 text-white"
>
  Reset Round of 32 to placeholders
</button>

          <div className="mt-6 space-y-4">
           {[1, 2, 3, 4].map((position) => {
  const selectedTeamIds = standings
    .filter(
      (row) =>
        row.group_name === selectedGroup && row.position !== position
    )
    .map((row) => row.team_id);

  return (
    <div key={position}>
      <label className="text-sm font-bold text-slate-900">
        Position {position}
      </label>

      <select
        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
        value={getTeamForPosition(position)}
        onChange={(e) => savePosition(position, e.target.value)}
      >
        <option value="">Select team</option>

        {teamsInSelectedGroup
          .filter((team: any) => !selectedTeamIds.includes(team.id))
          .map((team: any) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
      </select>
    </div>
  );
})}

<div className="mt-8 border-t border-slate-300 pt-6">
  <h2 className="text-2xl font-bold text-slate-900">Third-place Round of 32 slots</h2>

  <div className="mt-4 space-y-4">
    {thirdPlaceSlots.map((slot) => {
      const options = getThirdPlacedTeamsForPlaceholder(slot.placeholder);

      return (
        <div key={slot.id}>
          <label className="text-sm font-bold text-slate-900">
            Match {slot.fixture_match_number} {slot.side}: {slot.placeholder}
          </label>

          <select
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={slot.team_id || ""}
            onChange={(e) => saveThirdPlaceSlot(slot, e.target.value)}
          >
            <option value="">Select team</option>

            {options
              .filter(
                (team: any) =>
                  team.id === slot.team_id ||
                  !selectedThirdPlaceTeamIds.includes(team.id)
              )
              .map((team: any) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
          </select>
        </div>
      );
    })}
  </div>
</div>
          </div>

          {message && <p className="mt-4 text-sm font-medium text-slate-900">{message}</p>}
        </div>
      </main>
    </>
  );
}