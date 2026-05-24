"use client";

import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Fixture = {
  id: string;
  match_number: number;
  round_name: string;
  group_name: string | null;
  kickoff_at: string;
  home_team: string | null;
  away_team: string | null;
  home_placeholder: string | null;
  away_placeholder: string | null;
  home_score: number | null;
  away_score: number | null;
  winner_team_id: string | null;
  venue: string | null;
  city: string | null;
};

function getVenueTimeZone(city: string | null) {
  const timeZones: Record<string, string> = {
    "Atlanta": "America/New_York",
    "Arlington": "America/Chicago",
    "Boston": "America/New_York",
    "Dallas": "America/Chicago",
    "Foxborough": "America/New_York",
    "Guadalajara": "America/Mexico_City",
    "Guadalupe": "America/Monterrey",
    "Houston": "America/Chicago",
    "Kansas City": "America/Chicago",
    "Los Angeles": "America/Los_Angeles",
    "Mexico City": "America/Mexico_City",
    "Miami": "America/New_York",
    "Monterrey": "America/Monterrey",
    "New Jersey": "America/New_York",
    "Philadelphia": "America/New_York",
    "San Francisco Bay Area": "America/Los_Angeles",
    "Santa Clara": "America/Los_Angeles",
    "Seattle": "America/Los_Angeles",
    "Toronto": "America/Toronto",
    "Vancouver": "America/Vancouver",
    "Zapopan": "America/Mexico_City"
  };

  return city ? timeZones[city] || "America/Los_Angeles" : "America/Los_Angeles";
}


export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    async function loadFixtures() {
      const { data } = await supabase
        .from("fixtures")
        .select("*")
        .order("kickoff_at", { ascending: true });

const { data: teamsData } = await supabase
  .from("teams")
  .select("id, name, flag_url");

setTeams(teamsData || []);

      setFixtures(data || []);
    }

    loadFixtures();
  }, []);

  const groupedFixtures = fixtures.reduce<Record<string, Fixture[]>>(
    (groups, fixture) => {
      if (!groups[fixture.round_name]) {
        groups[fixture.round_name] = [];
      }

      groups[fixture.round_name].push(fixture);
      return groups;
    },
    {}
  );

const getTeamFlag = (teamName: string | null) => {
  return teams.find((team) => team.name === teamName)?.flag_url || null;
};

const getFixtureStatus = (fixture: any) => {
  if (
    fixture.home_score !== null &&
    fixture.away_score !== null
  ) {
    return "FT";
  }

  const kickoff = new Date(fixture.kickoff_at).getTime();
  const now = new Date().getTime();

  if (now >= kickoff) {
    return "LIVE";
  }

  return "UPCOMING";
};

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[url('/stadium.jpeg')] bg-cover bg-center bg-fixed">
      <div className="min-h-screen bg-black/40 p-8">
<div className="mx-auto mt-6 max-w-5xl rounded-2xl bg-white/90 p-6 shadow-2xl backdrop-blur-md ring-1 ring-white/20">
          <h1 className="text-3xl font-bold">Fixtures</h1>
<p className="mt-2 text-sm text-slate-600">
  All kickoff times shown in Pacific Time (PT), with local venue time below.
</p>
          <a
            href="/pick"
            className="mt-3 inline-block rounded bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300"
          >
            Back to picks
          </a>

          <div className="mt-8 space-y-8">
            {Object.entries(groupedFixtures).map(([roundName, roundFixtures]) => (
              <section key={roundName}>
                <h2 className="text-xl font-semibold">{roundName}</h2>

                <div className="mt-3 overflow-x-auto">
                  
                      <div className="mt-4 grid gap-6">
  {roundFixtures.map((fixture) => (
    <div
      key={fixture.id}
      className="rounded-2xl bg-white/90 p-5 shadow-xl backdrop-blur-sm ring-1 ring-white/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Match {fixture.match_number}
          </p>

          <p className="text-sm text-slate-500">
            {fixture.group_name || fixture.round_name}
          </p>
        </div>

        <span
          className={`rounded px-3 py-1 text-xs font-bold text-white ${
            fixture.home_score !== null &&
            fixture.away_score !== null
              ? "bg-slate-700"
              : new Date() >= new Date(fixture.kickoff_at)
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
        >
          {fixture.home_score !== null &&
          fixture.away_score !== null
            ? "FT"
            : new Date() >= new Date(fixture.kickoff_at)
            ? "LIVE"
            : "UPCOMING"}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex w-1/3 flex-col items-center text-center">
          {teams.find((team) => team.name === fixture.home_team)
            ?.flag_url && (
            <img
              src={
                teams.find((team) => team.name === fixture.home_team)
                  ?.flag_url
              }
              alt=""
              className="h-12 w-16 rounded object-cover shadow"
            />
          )}

          <p className="mt-2 font-semibold">
            {fixture.home_team ||
              fixture.home_placeholder ||
              "TBD"}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold">
            {fixture.home_score !== null &&
            fixture.away_score !== null
              ? `${fixture.home_score} - ${fixture.away_score}`
              : "vs"}
          </div>

       <div className="mt-2 text-center">
  <div className="text-sm font-medium text-slate-700">
    {new Date(fixture.kickoff_at).toLocaleString(
      "en-US",
      {
        timeZone: "America/Los_Angeles",
        dateStyle: "medium",
        timeStyle: "short",
      }
    )}{" "}
    PT
  </div>

  <div className="mt-1 text-xs text-slate-500">
    Local venue time:{" "}
    {new Date(fixture.kickoff_at).toLocaleString("en-US", {
  timeZone: getVenueTimeZone(fixture.city),
  dateStyle: "medium",
  timeStyle: "short",
})}
  </div>

  <div className="mt-1 text-xs text-slate-500">
    {fixture.venue || "-"}
    {fixture.city ? `, ${fixture.city}` : ""}
  </div>
</div>
        </div>

        <div className="flex w-1/3 flex-col items-center text-center">
          {teams.find((team) => team.name === fixture.away_team)
            ?.flag_url && (
            <img
              src={
                teams.find((team) => team.name === fixture.away_team)
                  ?.flag_url
              }
              alt=""
              className="h-12 w-16 rounded object-cover shadow"
            />
          )}

          <p className="mt-2 font-semibold">
            {fixture.away_team ||
              fixture.away_placeholder ||
              "TBD"}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>
                    
                </div>
              </section>
            ))}
          </div>

          {fixtures.length === 0 && (
            <p className="mt-4 text-sm text-slate-600">
              No fixtures have been added yet.
            </p>
          )}
        </div>
        </div>
      </main>
    </>
  );
}