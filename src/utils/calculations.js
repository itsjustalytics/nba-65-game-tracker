export function getGamesRemaining(teamGamesPlayed) {
  return Math.max(0, 82 - teamGamesPlayed);
}

export function getGamesNeeded(gamesPlayed) {
  return Math.max(0, 65 - gamesPlayed);
}

export function getMaxPossibleFinalGames(gamesPlayed, teamGamesPlayed) {
  return gamesPlayed + getGamesRemaining(teamGamesPlayed);
}

export function getProjectedFinalGames(gamesPlayed, teamGamesPlayed) {
  if (teamGamesPlayed <= 0) {
    return 0;
  }

  const playRate = gamesPlayed / teamGamesPlayed;
  return Number((playRate * 82).toFixed(1));
}

export function isMathematicallyEliminated(gamesPlayed, teamGamesPlayed) {
  return getMaxPossibleFinalGames(gamesPlayed, teamGamesPlayed) < 65;
}

export function getPlayerBucket(player) {
  if (player.gamesPlayed >= 65) {
    return "In The Clear";
  }

  if (player.mathematicallyEliminated) {
    return "Ineligible";
  }

  if (player.projectedFinalGames >= 70) {
    return "Safe Zone";
  }

  if (player.projectedFinalGames >= 65) {
    return "Cutting It Close";
  }

  return "Danger Zone";
}

export function enrichPlayer(player) {
  const gamesRemaining = getGamesRemaining(player.teamGamesPlayed);
  const gamesNeeded = getGamesNeeded(player.gamesPlayed);
  const maxPossibleFinalGames = getMaxPossibleFinalGames(
    player.gamesPlayed,
    player.teamGamesPlayed
  );
  const projectedFinalGames = getProjectedFinalGames(
    player.gamesPlayed,
    player.teamGamesPlayed
  );
  const mathematicallyEliminated = isMathematicallyEliminated(
    player.gamesPlayed,
    player.teamGamesPlayed
  );

  const enrichedPlayer = {
    ...player,
    gamesRemaining,
    gamesNeeded,
    maxPossibleFinalGames,
    projectedFinalGames,
    mathematicallyEliminated,
  };

  return {
    ...enrichedPlayer,
    bucket: getPlayerBucket(enrichedPlayer),
  };
}

export function enrichPlayers(players) {
  return players.map(enrichPlayer);
}