import { useMemo, useState } from "react";
import "./App.css";
import { players } from "./data/players";
import { enrichPlayers } from "./utils/calculations";

const tabs = [
  "All Players",
  "Award Eligible",
  "On Pace",
  "Worth Monitoring",
  "High Risk",
  "Ineligible",
];

function getBucketClass(bucket) {
  if (bucket === "Award Eligible") return "award-eligible";
  if (bucket === "On Pace") return "on-pace";
  if (bucket === "Worth Monitoring") return "worth-monitoring";
  if (bucket === "High Risk") return "high-risk";
  return "ineligible";
}

function App() {
  const [activeTab, setActiveTab] = useState("All Players");

  const enrichedPlayers = useMemo(() => enrichPlayers(players), []);

  const summaryCounts = useMemo(() => {
    return {
      all: enrichedPlayers.length,
      awardEligible: enrichedPlayers.filter(
        (player) => player.bucket === "Award Eligible"
      ).length,
      onPace: enrichedPlayers.filter(
        (player) => player.bucket === "On Pace"
      ).length,
      worthMonitoring: enrichedPlayers.filter(
        (player) => player.bucket === "Worth Monitoring"
      ).length,
      highRisk: enrichedPlayers.filter(
        (player) => player.bucket === "High Risk"
      ).length,
      ineligible: enrichedPlayers.filter(
        (player) => player.bucket === "Ineligible"
      ).length,
    };
  }, [enrichedPlayers]);

  const filteredPlayers = useMemo(() => {
    if (activeTab === "All Players") {
      return enrichedPlayers;
    }

    return enrichedPlayers.filter((player) => player.bucket === activeTab);
  }, [activeTab, enrichedPlayers]);

  return (
    <div className="app-container">
      <header className="page-header">
        <div className="title-eyebrow">Awards Availability Dashboard</div>
        <h1 className="main-title">NBA 65 Game Tracker</h1>
        <p className="page-subtitle">
          See if your favorite player is on pace to be eligible for regular season awards this season.
        </p>
      </header>

      <section className="summary-cards">
        <button
          className={`summary-card summary-card-all ${
            activeTab === "All Players" ? "active-summary-card" : ""
          }`}
          onClick={() => setActiveTab("All Players")}
        >
          <h3>All Players</h3>
          <p>{summaryCounts.all}</p>
        </button>

        <button
          className={`summary-card summary-card-eligible ${
            activeTab === "Award Eligible" ? "active-summary-card" : ""
          }`}
          onClick={() => setActiveTab("Award Eligible")}
        >
          <h3>Award Eligible</h3>
          <p>{summaryCounts.awardEligible}</p>
        </button>

        <button
          className={`summary-card summary-card-pace ${
            activeTab === "On Pace" ? "active-summary-card" : ""
          }`}
          onClick={() => setActiveTab("On Pace")}
        >
          <h3>On Pace</h3>
          <p>{summaryCounts.onPace}</p>
        </button>

        <button
          className={`summary-card summary-card-monitoring ${
            activeTab === "Worth Monitoring" ? "active-summary-card" : ""
          }`}
          onClick={() => setActiveTab("Worth Monitoring")}
        >
          <h3>Worth Monitoring</h3>
          <p>{summaryCounts.worthMonitoring}</p>
        </button>

        <button
          className={`summary-card summary-card-risk ${
            activeTab === "High Risk" ? "active-summary-card" : ""
          }`}
          onClick={() => setActiveTab("High Risk")}
        >
          <h3>High Risk</h3>
          <p>{summaryCounts.highRisk}</p>
        </button>

        <button
          className={`summary-card summary-card-ineligible ${
            activeTab === "Ineligible" ? "active-summary-card" : ""
          }`}
          onClick={() => setActiveTab("Ineligible")}
        >
          <h3>Ineligible</h3>
          <p>{summaryCounts.ineligible}</p>
        </button>
      </section>

      <section className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active-tab" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </section>

      <section className="table-section">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Team</th>
                <th>GP</th>
                <th>Team GP</th>
                <th>Remaining</th>
                <th>Needed</th>
                <th>Max Final</th>
                <th>Projected Final</th>
                <th>Eliminated?</th>
                <th>Bucket</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => {
                const rowClass = getBucketClass(player.bucket);

                return (
                  <tr key={player.id} className={rowClass}>
                    <td>{player.name}</td>
                    <td>{player.team}</td>
                    <td>{player.gamesPlayed}</td>
                    <td>{player.teamGamesPlayed}</td>
                    <td>{player.gamesRemaining}</td>
                    <td>{player.gamesNeeded}</td>
                    <td>{player.maxPossibleFinalGames}</td>
                    <td>{player.projectedFinalGames}</td>
                    <td>{player.mathematicallyEliminated ? "Yes" : "No"}</td>
                    <td className="bucket-text">{player.bucket}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glossary-section">
        <h2>Glossary</h2>
        <div className="glossary-grid">
          <div className="glossary-card">
            <h3>GP</h3>
            <p>The number of regular-season games the player has appeared in so far.</p>
          </div>

          <div className="glossary-card">
            <h3>Team GP</h3>
            <p>The number of regular-season games the player’s team has played so far.</p>
          </div>

          <div className="glossary-card">
            <h3>Remaining</h3>
            <p>How many games are left on the team’s 82-game schedule.</p>
          </div>

          <div className="glossary-card">
            <h3>Needed</h3>
            <p>How many more games the player still needs to reach 65.</p>
          </div>

          <div className="glossary-card">
            <h3>Max Final</h3>
            <p>The best-case finish if the player appears in every game left.</p>
          </div>

          <div className="glossary-card">
            <h3>Projected Final</h3>
            <p>An estimate of where the player would finish if they stay on their current pace.</p>
          </div>

          <div className="glossary-card">
            <h3>Award Eligible</h3>
            <p>The player has already reached 65 and is safely in.</p>
          </div>

          <div className="glossary-card">
            <h3>On Pace</h3>
            <p>The player is tracking comfortably above the line.</p>
          </div>

          <div className="glossary-card">
            <h3>Worth Monitoring</h3>
            <p>The player is still on track, but the cushion is getting smaller.</p>
          </div>

          <div className="glossary-card">
            <h3>High Risk</h3>
            <p>The player can still get there, but right now the math is not in their favor.</p>
          </div>

          <div className="glossary-card">
            <h3>Ineligible</h3>
            <p>The player can no longer reach 65, even in a best-case finish.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;