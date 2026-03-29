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

export function getAdjustedMaxPossibleFinalGames(
  gamesPlayed,
  teamGamesPlayed,
  expectedMissedGames = 0
) {
  const maxPossibleFinalGames = getMaxPossibleFinalGames(
    gamesPlayed,
    teamGamesPlayed
  );

  return Math.max(0, maxPossibleFinalGames - expectedMissedGames);
}

export function getAdjustedProjectedFinalGames(
  gamesPlayed,
  teamGamesPlayed,
  expectedMissedGames = 0
) {
  const projectedFinalGames = getProjectedFinalGames(
    gamesPlayed,
    teamGamesPlayed
  );

  return Math.max(0, projectedFinalGames - expectedMissedGames);
}

export function isMathematicallyEliminated(
  gamesPlayed,
  teamGamesPlayed,
  expectedMissedGames = 0
) {
  return (
    getAdjustedMaxPossibleFinalGames(
      gamesPlayed,
      teamGamesPlayed,
      expectedMissedGames
    ) < 65
  );
}

export function getPlayerBucket(player) {
  if (player.gamesPlayed >= 65) {
    return "Award Eligible";
  }

  if (player.mathematicallyEliminated) {
    return "Ineligible";
  }

  if (player.adjustedProjectedFinalGames >= 70) {
    return "On Pace";
  }

  if (player.adjustedProjectedFinalGames >= 65) {
    return "Worth Monitoring";
  }

  return "High Risk";
}

export function enrichPlayer(player) {
  const expectedMissedGames = Number(player.expectedMissedGames ?? 0);
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

  const adjustedMaxPossibleFinalGames = getAdjustedMaxPossibleFinalGames(
    player.gamesPlayed,
    player.teamGamesPlayed,
    expectedMissedGames
  );

  const adjustedProjectedFinalGames = getAdjustedProjectedFinalGames(
    player.gamesPlayed,
    player.teamGamesPlayed,
    expectedMissedGames
  );

  const mathematicallyEliminated = isMathematicallyEliminated(
    player.gamesPlayed,
    player.teamGamesPlayed,
    expectedMissedGames
  );

  const enrichedPlayer = {
    ...player,
    expectedMissedGames,
    gamesRemaining,
    gamesNeeded,
    maxPossibleFinalGames,
    projectedFinalGames,
    adjustedMaxPossibleFinalGames,
    adjustedProjectedFinalGames,
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