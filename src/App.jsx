import "./App.css";
import { players } from "./data/players";
import { enrichPlayers } from "./utils/calculations";

function App() {
  const enrichedPlayers = enrichPlayers(players);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>NBA 65 Game Tracker</h1>
      <p>Issue #4 bucket logic test</p>

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
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
          {enrichedPlayers.map((player) => (
            <tr key={player.id}>
              <td>{player.name}</td>
              <td>{player.team}</td>
              <td>{player.gamesPlayed}</td>
              <td>{player.teamGamesPlayed}</td>
              <td>{player.gamesRemaining}</td>
              <td>{player.gamesNeeded}</td>
              <td>{player.maxPossibleFinalGames}</td>
              <td>{player.projectedFinalGames}</td>
              <td>{player.mathematicallyEliminated ? "Yes" : "No"}</td>
              <td>{player.bucket}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;