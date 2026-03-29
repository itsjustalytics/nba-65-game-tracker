# NBA 65 Game Tracker

A web application that tracks NBA player eligibility for end-of-season awards based on the NBA’s 65-game requirement rule.

## Overview

This project analyzes player availability throughout the season and categorizes players based on their likelihood of meeting the 65-game threshold required for awards such as MVP, All-NBA, and Defensive Player of the Year.

The goal is to simulate real-world analytics workflows used by NBA front offices while building a scalable sports analytics platform.

## Features (Planned)

- Track players across multiple eligibility tiers:
  - Eligible (65+ games)
  - Safe
  - Near Risk
  - On Pace to Miss
  - Eliminated
- Injury-aware tracking (context for missed games)
- Projection logic based on remaining games
- Future: Award prediction engine (MVP, All-NBA, All-Defense, Rookie)

## Tech Stack

- React (Vite)
- JavaScript
- WSL (Linux development environment)
- Git + GitHub (version control)

## Project Structure

src/
  components/   # UI components
  data/         # local datasets (players, etc.)
  utils/        # calculation logic
  services/     # API integration (future)

## Getting Started

1. Install dependencies

npm install

2. Run development server

npm run dev

3. Open in browser

http://localhost:5173