# Fictional-Media Timeline Viewer & Studio

_A personal tool for creating and exploring fictional timelines,
starting with the Marvel Cinematic Universe._

Inspired by an Excel workflow, Timeline Studio uses character rows,
chronological project columns and visual lifelines to track appearances
and events within each universe.

## Current version — `0.4.3`

A cleaner timeline with selectable character names that reveal a character detail panel showing facts, a summary, and a list of their chronological appearances and events.

See the [development plan](docs/development-plan.md) for the agreed order and scope of development.

> ![Studio](docs/images/timeline-studio-v0.4.3-studio-panel-&-editor.png)

> ![Viewer](docs/images/timeline-studio-v0.4.3-viewer-panel-&-details.png)

## Aim

Make fictional universes easier to explore through timelines, character histories, project details and statistics.

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
refreshed from read-only live metadata on 20 October 2026 and include the
universe-specific entry constraints, publication policies and application functions.
They are reference snapshots rather than complete database backups.

