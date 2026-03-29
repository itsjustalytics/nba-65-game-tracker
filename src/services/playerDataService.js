import rawPlayers from "../data/players.json";

function normalizePlayer(rawPlayer) {
  return {
    id: Number(rawPlayer.id),
    name: rawPlayer.name,
    team: rawPlayer.team,
    gamesPlayed: Number(rawPlayer.gamesPlayed),
    teamGamesPlayed: Number(rawPlayer.teamGamesPlayed),
    status: rawPlayer.status ?? "Healthy",
    injuryNote: rawPlayer.injuryNote ?? null,
    estimatedReturnDate: rawPlayer.estimatedReturnDate ?? null,
    expectedMissedGames: Number(rawPlayer.expectedMissedGames ?? 0),
  };
}

export function getPlayers() {
  return rawPlayers.map(normalizePlayer);
}