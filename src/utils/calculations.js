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
  return Math.round(playRate * 82);
}

export function isMathematicallyEliminated(gamesPlayed, teamGamesPlayed) {
  return getMaxPossibleFinalGames(gamesPlayed, teamGamesPlayed) < 65;
}

export function getPlayerBucket(player) {
  if (player.gamesPlayed >= 65) {
    return "Award Eligible";
  }

  if (player.mathematicallyEliminated) {
    return "Ineligible";
  }

  if (player.projectedFinalGames >= 70) {
    return "On Pace";
  }

  if (player.projectedFinalGames >= 65) {
    return "Worth Monitoring";
  }

  return "High Risk";
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