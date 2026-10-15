# Fictional-Media Timeline Viewer

_A personal tool for exploring and editing fictional-media timelines,
starting with the Marvel Cinematic Universe._

Inspired by an Excel workflow, Timeline Studio places characters in rows
and projects in chronological columns, with appearance markers and
automatically calculated character lifelines.

## Current version — `0.3.2`

Appearances and character events are now independent for each universe timeline.

Projects and characters retain shared identities, while appearance types,
detached appearances, character events and project order belong to the selected
timeline. Editing Iron Man's Endgame cell on a Time Heist timeline no longer
changes his MCU appearance or death.

See the [development plan](docs/development-plan.md) for the agreed order and scope.

> ![Origins](docs/images/timeline-studio-v0.3.0-character-origins.png)

> ![Focus](docs/images/timeline-studio-v0.3.0-character-focus.png)

## Aim

To build a feature-packed application showing various film franchise timelines with up-to-date project and character viewers and statistics.

## Screenshots

See the [progress screenshots](docs/images).

## Stack

![Vite](https://img.shields.io/badge/Vite-9135FF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=1f212d)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-1d232a?style=for-the-badge&logo=supabase&logoColor=3FCF8E)

## Database

Supabase is the source of truth. Files in [docs/supabase](docs/supabase) are
database references, not files the app runs to create its database. They were
refreshed from read-only live metadata on 15 October 2026 and include the
universe-specific entry constraints, current policies and application functions.
They are reference snapshots rather than complete database backups.
