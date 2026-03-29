import json
from datetime import date
from pathlib import Path

import pandas as pd
from nba_api.stats.endpoints import (
    leaguedashplayerstats,
    leaguestandingsv3,
    scheduleleaguev2,
)

SEASON = "2025-26"
TODAY = date(2026, 3, 29)
OUTPUT_PATH = Path("src/data/players.json")
ESPN_INJURIES_URL = "https://www.espn.com/nba/injuries"


def build_team_games_map() -> dict[int, int]:
    standings = leaguestandingsv3.LeagueStandingsV3(
        season=SEASON,
        league_id="00",
        season_type="Regular Season",
        timeout=30,
    )

    df = standings.get_data_frames()[0]
    team_games = {}

    for _, row in df.iterrows():
        team_id = row.get("TeamID")
        wins = row.get("WINS")
        losses = row.get("LOSSES")

        if pd.isna(team_id) or pd.isna(wins) or pd.isna(losses):
            continue

        team_games[int(team_id)] = int(wins) + int(losses)

    return team_games


def build_team_schedule_map() -> dict[int, list[date]]:
    schedule = scheduleleaguev2.ScheduleLeagueV2(
        league_id="00",
        season=SEASON,
        timeout=30,
    )

    df = schedule.get_data_frames()[0]
    team_schedule_map: dict[int, list[date]] = {}

    for _, row in df.iterrows():
        game_date_raw = row.get("gameDate")
        home_team_id = row.get("homeTeam_teamId")
        away_team_id = row.get("awayTeam_teamId")

        if pd.isna(game_date_raw) or pd.isna(home_team_id) or pd.isna(away_team_id):
            continue

        game_date = pd.to_datetime(game_date_raw).date()
        home_team_id = int(home_team_id)
        away_team_id = int(away_team_id)

        team_schedule_map.setdefault(home_team_id, []).append(game_date)
        team_schedule_map.setdefault(away_team_id, []).append(game_date)

    for team_id in team_schedule_map:
        team_schedule_map[team_id] = sorted(set(team_schedule_map[team_id]))

    return team_schedule_map


def clean_player_name(name: str) -> str:
    return " ".join(str(name).strip().split()).lower()


def parse_espn_return_date(raw_value: str) -> date | None:
    if raw_value is None or str(raw_value).strip() == "":
        return None

    raw_value = str(raw_value).strip()

    parsed = pd.to_datetime(raw_value, errors="coerce")
    if pd.notna(parsed):
        parsed_date = parsed.date()
        if parsed_date < TODAY and parsed_date.month >= 7:
            return parsed_date
        if parsed_date < TODAY and parsed_date.year == TODAY.year:
            return parsed_date.replace(year=TODAY.year + 1)
        return parsed_date

    parsed = pd.to_datetime(f"{raw_value} {TODAY.year}", errors="coerce")
    if pd.notna(parsed):
        parsed_date = parsed.date()
        if parsed_date < TODAY:
            return parsed_date.replace(year=TODAY.year + 1)
        return parsed_date

    return None


def build_espn_injury_map() -> dict[str, dict]:
    injury_map: dict[str, dict] = {}
    tables = pd.read_html(ESPN_INJURIES_URL)

    for table in tables:
        normalized = {str(col).strip().upper(): col for col in table.columns}

        if "NAME" not in normalized or "STATUS" not in normalized:
            continue

        name_col = normalized["NAME"]
        status_col = normalized["STATUS"]
        return_col = normalized.get("EST. RETURN DATE")
        comment_col = normalized.get("COMMENT")

        for _, row in table.iterrows():
            raw_name = row.get(name_col)
            raw_status = row.get(status_col)

            if pd.isna(raw_name) or pd.isna(raw_status):
                continue

            cleaned_name = clean_player_name(raw_name)
            estimated_return_date = None
            injury_note = None

            if return_col is not None:
                estimated_return_date = parse_espn_return_date(row.get(return_col))

            if comment_col is not None and pd.notna(row.get(comment_col)):
                injury_note = str(row.get(comment_col)).strip()

            injury_map[cleaned_name] = {
                "status": str(raw_status).strip(),
                "injuryNote": injury_note,
                "estimatedReturnDate": (
                    estimated_return_date.isoformat() if estimated_return_date else None
                ),
            }

    return injury_map


def count_expected_missed_games(
    team_id: int,
    team_games_played: int,
    estimated_return_date: date | None,
    team_schedule_map: dict[int, list[date]],
) -> int:
    if estimated_return_date is None:
        return 0

    all_future_games = [
        game_date
        for game_date in team_schedule_map.get(team_id, [])
        if game_date >= TODAY
    ]

    regular_season_games_remaining = max(0, 82 - team_games_played)
    regular_season_future_games = all_future_games[:regular_season_games_remaining]

    if estimated_return_date.month > 6:
        return len(regular_season_future_games)

    return sum(1 for game_date in regular_season_future_games if game_date < estimated_return_date)


def build_players(
    team_games_map: dict[int, int],
    team_schedule_map: dict[int, list[date]],
    injury_map: dict[str, dict],
) -> list[dict]:
    player_stats = leaguedashplayerstats.LeagueDashPlayerStats(
        season=SEASON,
        season_type_all_star="Regular Season",
        per_mode_detailed="PerGame",
        timeout=30,
    )

    df = player_stats.get_data_frames()[0]
    players = []

    for _, row in df.iterrows():
        player_id = row.get("PLAYER_ID")
        team_id = row.get("TEAM_ID")
        name = row.get("PLAYER_NAME")
        team = row.get("TEAM_ABBREVIATION")
        gp = row.get("GP")

        if (
            pd.isna(player_id)
            or pd.isna(team_id)
            or pd.isna(name)
            or pd.isna(team)
            or pd.isna(gp)
        ):
            continue

        player_id = int(player_id)
        team_id = int(team_id)
        games_played = int(gp)
        team_games_played = int(team_games_map.get(team_id, 82))

        injury_info = injury_map.get(
            clean_player_name(name),
            {
                "status": "Healthy",
                "injuryNote": None,
                "estimatedReturnDate": None,
            },
        )

        estimated_return_date = (
            pd.to_datetime(injury_info["estimatedReturnDate"]).date()
            if injury_info["estimatedReturnDate"]
            else None
        )

        expected_missed_games = count_expected_missed_games(
            team_id=team_id,
            team_games_played=team_games_played,
            estimated_return_date=estimated_return_date,
            team_schedule_map=team_schedule_map,
        )

        players.append(
            {
                "id": player_id,
                "name": str(name),
                "team": str(team),
                "gamesPlayed": games_played,
                "teamGamesPlayed": team_games_played,
                "status": injury_info["status"] if injury_info["status"] else "Healthy",
                "injuryNote": injury_info["injuryNote"],
                "estimatedReturnDate": injury_info["estimatedReturnDate"],
                "expectedMissedGames": expected_missed_games,
            }
        )

    players.sort(key=lambda player: player["name"])
    return players


def main():
    print(f"Fetching NBA season data for {SEASON}...")

    team_games_map = build_team_games_map()
    print(f"Loaded team games for {len(team_games_map)} teams")

    team_schedule_map = build_team_schedule_map()
    print(f"Loaded schedules for {len(team_schedule_map)} teams")

    injury_map = build_espn_injury_map()
    print(f"Loaded ESPN injury records for {len(injury_map)} players")

    players = build_players(
        team_games_map=team_games_map,
        team_schedule_map=team_schedule_map,
        injury_map=injury_map,
    )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(players, indent=2), encoding="utf-8")

    print(f"Wrote {len(players)} current-season players to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()