import { useMemo, useState } from "react";
import "./App.css";
import { enrichPlayers } from "./utils/calculations";
import { getPlayers } from "./services/playerDataService";

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

function getStatusClass(status) {
  const normalized = String(status ?? "Healthy").toLowerCase();

  if (normalized.includes("out")) return "status-out";
  if (
    normalized.includes("questionable") ||
    normalized.includes("doubtful") ||
    normalized.includes("day-to-day")
  ) {
    return "status-warning";
  }

  return "status-good";
}

function formatExpectedReturn(dateString) {
  if (!dateString) return "—";

  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "—";

  const month = parsed.getMonth() + 1;

  if (month > 6) {
    return "Next Year";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function App() {
  const [activeTab, setActiveTab] = useState("All Players");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [sortConfig, setSortConfig] = useState({
    key: "adjustedProjectedFinalGames",
    direction: "desc",
  });

  const enrichedPlayers = useMemo(() => {
    const players = getPlayers();
    return enrichPlayers(players);
  }, []);

  const teamOptions = useMemo(() => {
    const teams = [...new Set(enrichedPlayers.map((player) => player.team))].sort();
    return ["All Teams", ...teams];
  }, [enrichedPlayers]);

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
    let result = [...enrichedPlayers];

    if (activeTab !== "All Players") {
      result = result.filter((player) => player.bucket === activeTab);
    }

    if (selectedTeam !== "All Teams") {
      result = result.filter((player) => player.team === selectedTeam);
    }

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (player) =>
          player.name.toLowerCase().includes(lowerSearch) ||
          player.team.toLowerCase().includes(lowerSearch)
      );
    }

    result.sort((a, b) => {
      const { key, direction } = sortConfig;

      let aValue = a[key];
      let bValue = b[key];

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [activeTab, selectedTeam, searchTerm, sortConfig, enrichedPlayers]);

  function handleSort(key) {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: "asc",
      };
    });
  }

  function getSortArrow(key) {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  }

  return (
    <div className="app-container">
      <header className="page-header">
        <div className="title-eyebrow">Awards Eligibility Dashboard</div>
        <h1 className="main-title">NBA 65 Game Tracker</h1>
        <p className="page-subtitle">
          Under the NBA’s current rules, players need to appear in at
          least 65 regular season games to qualify for end-of-season awards. This
          tracker shows who has already cleared that mark, who is on pace
          to get there, and who may not be eligible.
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

      <section className="table-controls">
        <input
          type="text"
          placeholder="Search player or team..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="search-input"
        />

        <select
          className="team-select"
          value={selectedTeam}
          onChange={(event) => setSelectedTeam(event.target.value)}
        >
          {teamOptions.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </section>

      <section className="table-section">
        <div className="table-shell">
          <div className="table-header-bar">
            <span>
              Showing {filteredPlayers.length} player
              {filteredPlayers.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort("name")} className="sortable">
                    Player{getSortArrow("name")}
                  </th>
                  <th onClick={() => handleSort("team")} className="sortable">
                    Team{getSortArrow("team")}
                  </th>
                  <th onClick={() => handleSort("gamesPlayed")} className="sortable">
                    GP{getSortArrow("gamesPlayed")}
                  </th>
                  <th onClick={() => handleSort("teamGamesPlayed")} className="sortable">
                    Team GP{getSortArrow("teamGamesPlayed")}
                  </th>
                  <th onClick={() => handleSort("gamesNeeded")} className="sortable">
                    Games Needed{getSortArrow("gamesNeeded")}
                  </th>
                  <th
                    onClick={() => handleSort("adjustedMaxPossibleFinalGames")}
                    className="sortable"
                  >
                    Adj. Max{getSortArrow("adjustedMaxPossibleFinalGames")}
                  </th>
                  <th
                    onClick={() => handleSort("adjustedProjectedFinalGames")}
                    className="sortable"
                  >
                    Adj. Proj{getSortArrow("adjustedProjectedFinalGames")}
                  </th>
                  <th onClick={() => handleSort("expectedMissedGames")} className="sortable">
                    Exp. Missed{getSortArrow("expectedMissedGames")}
                  </th>
                  <th
                    onClick={() => handleSort("estimatedReturnDate")}
                    className="sortable"
                  >
                    Expected Return{getSortArrow("estimatedReturnDate")}
                  </th>
                  <th onClick={() => handleSort("status")} className="sortable">
                    Status{getSortArrow("status")}
                  </th>
                  <th onClick={() => handleSort("bucket")} className="sortable">
                    Outlook{getSortArrow("bucket")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => {
                  const rowClass = getBucketClass(player.bucket);

                  return (
                    <tr key={player.id} className={rowClass}>
                      <td>
                        <div className="player-name-cell">
                          <span className="player-name">{player.name}</span>
                          {player.injuryNote && (
                            <span className="injury-note-text">{player.injuryNote}</span>
                          )}
                        </div>
                      </td>
                      <td>{player.team}</td>
                      <td>{player.gamesPlayed}</td>
                      <td>{player.teamGamesPlayed}</td>
                      <td>{player.gamesNeeded}</td>
                      <td>{player.adjustedMaxPossibleFinalGames}</td>
                      <td>{player.adjustedProjectedFinalGames}</td>
                      <td>{player.expectedMissedGames}</td>
                      <td>{formatExpectedReturn(player.estimatedReturnDate)}</td>
                      <td>
                        <div className={`status-chip ${getStatusClass(player.status)}`}>
                          {player.status || "Healthy"}
                        </div>
                      </td>
                      <td className="bucket-text">{player.bucket}</td>
                    </tr>
                  );
                })}

                {filteredPlayers.length === 0 && (
                  <tr className="empty-row">
                    <td colSpan="11" className="empty-cell">
                      No players match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
            <p>The number of regular-season games the player’s current team has played so far.</p>
          </div>

          <div className="glossary-card">
            <h3>Games Needed</h3>
            <p>How many more games the player still needs to reach 65.</p>
          </div>

          <div className="glossary-card">
            <h3>Adj. Max</h3>
            <p>The player’s best-case finish after accounting for expected missed games.</p>
          </div>

          <div className="glossary-card">
            <h3>Adj. Proj</h3>
            <p>The player’s projected finish after accounting for expected missed games.</p>
          </div>

          <div className="glossary-card">
            <h3>Exp. Missed</h3>
            <p>Estimated games the player is expected to miss before returning.</p>
          </div>

          <div className="glossary-card">
            <h3>Expected Return</h3>
            <p>The estimated date the player is expected back, or Next Year if it falls after June.</p>
          </div>

          <div className="glossary-card">
            <h3>Outlook</h3>
            <p>The player’s overall eligibility outlook based on availability, schedule, and injury context.</p>
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
            <p>The player is still on track, but the margin is getting tighter.</p>
          </div>

          <div className="glossary-card">
            <h3>High Risk</h3>
            <p>The player still has a path, but missed time is putting 65 in real danger.</p>
          </div>

          <div className="glossary-card">
            <h3>Ineligible</h3>
            <p>The player no longer has a realistic path to 65 based on the remaining schedule.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;