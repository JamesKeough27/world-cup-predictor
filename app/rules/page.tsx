import Navbar from "@/components/navbar";

export default function RulesPage() {
  return (
      <>
    <Navbar />
    <main className="min-h-screen bg-[url('/Sent-Off.png')] bg-cover bg-center bg-fixed">
  <div className="min-h-screen bg-black/35 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-white/20">
        <h1 className="text-3xl font-bold text-slate-900">World Cup 2026 Pool Rules</h1>

<p className="mt-2 text-base font-semibold text-slate-700">
  Pick winners, score points, and climb the leaderboard.
</p>

        <div className="mt-6 space-y-4 text-slate-700">
          <p>Pick one team each calendar day during the group stage, and per round during the knockout stage.</p>
           <p>
            You can only pick from teams that are playing in the current day/round, and you cannot pick a team that you have already picked in a previous day/round. This will reset at the quarter final stage, allowing you to choose repeats beyond this point.
          </p>
          <p> The leaderboard will be determined by the total points accumulated throughout the tournament. Ties will be settled by (1) the closest goals scored predicted followed by (2) total number of correct predicted winners</p>

<div className="mt-6 rounded-2xl bg-blue-50 p-5 shadow-sm">
  <h2 className="text-2xl font-bold text-slate-900">Scoring</h2>

  <ul className="mt-4 space-y-3 text-base font-medium text-slate-800">
    <li><strong className="text-blue-800">Group stage:</strong> <strong>1 point</strong></li>
    <li><strong className="text-blue-800">Round of 32:</strong> <strong>2 points</strong></li>
    <li><strong className="text-blue-800">Round of 16:</strong> <strong>3 points</strong></li>
    <li><strong className="text-blue-800">Quarter-finals:</strong> <strong>4 points</strong></li>
    <li><strong className="text-blue-800">Semi-finals:</strong> <strong>5 points</strong></li>
    <li><strong className="text-blue-800">Final:</strong> <strong>8 points</strong></li>
  </ul>
</div>

        <p>Comments to be provided to league admin (James Keough)</p>

</div>

<section className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
  <h2 className="text-2xl font-bold text-slate-900">
    💰 Optional Cash Game
  </h2>

  <p className="mt-3 text-base leading-7 text-slate-800">
    An optional cash-game competition will run alongside the main tournament.
    If you would like to take part, please let James know before{" "}
    <strong>11 June 2026</strong>.
  </p>

  <p className="mt-4 text-base leading-7 text-slate-800">
    The expected entry fee is approximately{" "}
    <strong>£20 / €23 / $27</strong>, depending on exchange rates.
  </p>

  <p className="mt-4 text-base leading-7 text-slate-800">
    The total prize pot will be distributed as follows:
  </p>

  <ul className="mt-3 space-y-2 text-base font-medium text-slate-800">
    <li>
      🥇 <strong>1st place:</strong> 60%
    </li>
    <li>
      🥈 <strong>2nd place:</strong> 30%
    </li>
    <li>
      🥉 <strong>3rd place:</strong> 10%
    </li>
  </ul>

  <p className="mt-4 text-base leading-7 text-slate-800">
    Players entered into the cash game will be marked with a{" "}
    <strong>💰 money pot symbol</strong> on the leaderboard.
  </p>
</section>


        <a href="/pick" className="mt-8 inline-block rounded bg-black px-4 py-2 text-white">
          Back to Picks
        </a>
      </div>
      </div>
    </main>
    </>
  );
}