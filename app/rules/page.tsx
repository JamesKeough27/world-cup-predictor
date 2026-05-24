import Navbar from "@/components/navbar";

export default function RulesPage() {
  return (
      <>
    <Navbar />
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">World Cup 2026 Pool Rules</h1>

        <div className="mt-6 space-y-4 text-slate-700">
          <p>Pick one team each calendar day during the group stage, and per round during the knockout stage.</p>
           <p>
            You can only pick from teams that are playing in the current day/round, and you cannot pick a team that you have already picked in a previous day/round. This will reset at the quarter final stage, allowing you to choose repeats beyond this point.
          </p>
          <p>Points will be awarded for wins that you correctly pick, according to:</p>
          <p>- one point for each correct pick in Group Stages</p>
          <p>- two points for a correct pick in the last 32</p>
          <p>- three points for a correct pick in the last 16</p>
          <p>- four points for a correct pick in the quarter finals</p>
          <p>- five points for a correct pick in the semi finals</p>
          <p>- eight points for a correct pick in the final</p>

        <p>comments to be provided to league admin (James Keough)</p>

</div>
        <a href="/pick" className="mt-8 inline-block rounded bg-black px-4 py-2 text-white">
          Back to Picks
        </a>
      </div>
    </main>
    </>
  );
}