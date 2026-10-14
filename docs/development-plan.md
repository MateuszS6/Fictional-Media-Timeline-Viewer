# Timeline Studio development plan

Updated 14 October 2026 for v0.3.2. The user has implemented universe-specific appearances/events and reports that the pass works as intended. The application source has been reviewed and passes TypeScript and lint checks. Direct verification of the live database is pending an MCP connection.

## Working agreement

- Keep implementation instructions, code and concise learning explanations in chat. The user applies application and database changes. Documentation may be updated directly.
- Ask clarification questions in the final chat response so the user can answer in a later message. Avoid disappearing question prompts.
- Finish required functionality before extras. Clarify new behaviour or scope when it is not already agreed.
- Supabase is the source of truth. Files under docs/supabase are reference snapshots, not automatically applied migrations or complete live exports.
- The current checkout is C:/Users/matbu/Documents/Projects/Fictional-Media-Timeline-Viewer.

## Current baseline: v0.3.2

- Franchise/universe and character/project create, edit and delete controls are implemented.
- Characters and projects require origin/primary universes; universes require a local name and can optionally have a code.
- Projects can be linked to multiple timelines, reordered independently, removed from one timeline, or deleted globally. Projects without a timeline link remain accessible through the existing-project picker within their primary universe's franchise.
- Each appearance and event belongs to one timeline universe. All entry-service reads, creates, updates, deletes and event upserts include that universe.
- Automatic participation, visitor-origin navigation, temporary editing rows, focus/highlighting and the pending-write guard remain implemented.
- Application types, services, TimelineGrid calls and participation queries reflect the new scope. Project-removal confirmation explains that the selected timeline's entries are deleted and relinking starts empty.
- Both TypeScript configurations and lint pass on the implemented source. Earlier tests of the proposed service changes covered universe/project isolation, event upsert identity, event-only participation, last-entry removal and error propagation.
- The user reports successful behaviour after applying the pass. This is distinct from an independent check of live constraints: the assistant has not yet queried the database or interactively tested the app.
- docs/supabase/schema.sql is explicitly marked outdated. Do not use its old character/project-only entry keys as the current design.

## Product rules

- Every character and project has an origin universe, including universes without an official designation or universes destroyed in the story.
- Keep a required local universe name and optional code. Main Continuity is acceptable for a franchise with one continuity; a code can be the local name if there is no official name.
- Compact visitor labels prefer a nonblank code, then name, then a readable fallback. Headings/selectors can retain the local name. Origin navigation currently stays within the selected franchise.
- Variants are versions from different universes. Keep distinct character IDs; do not introduce a same-origin variant system, numerical cap or new uniqueness constraint without a concrete requirement. The supplied constraints did not establish the complete set of standalone unique indexes.
- Franchise membership does not add projects to every universe chronology. MCU footage characters can appear in Loki on TVA without adding Loki to the MCU timeline.
- A shared project can depict different appearances/events on different timelines. Iron Man's Endgame death on MCU does not imply a death on the 2012 New York Time Heist timeline.
- Normal universe deletion remains blocked by originating characters, primary projects and timeline project links.
- Force deletion remains deferred. Agree on its scope before implementing it; visiting characters must not be deleted merely because a visited universe is removed.

## Completed pass: independent appearances and events

Implemented by the user for v0.3.2:

- Add required universe_id to appearances and character_events. Entry location and character origin are separate concepts.
- Appearance identity is (universe_id, character_id, project_id).
- Events retain their existing id primary key and use a unique (universe_id, character_id, project_id) constraint. There is still at most one event per cell.
- Each entry table references universe_projects through (universe_id, project_id) with ON DELETE CASCADE. Entries cannot exist without a matching project link; removing that link deletes only its timeline's entries.
- Global character/project deletion still removes related entries across timelines. Universe deletion restrictions remain.
- Existing entries were to be retained once on each project's primary universe: Endgame -> MCU, Loki S1 -> TVA. The migration checks for missing destination links instead of silently inventing chronology columns or discarding entries.
- The user's completion report covers the applied pass. Confirm the actual keys, nullability, foreign keys and deletion rules through read-only database inspection once connected.
- Retain shared character/project records and the existing project RPCs. No new entry tables or cleanup RPCs are required.

## Automatic participation and editing

- Ordinary timeline rows come from appearances OR events belonging to that universe and its projects. Include event-only characters, footage and detached appearances.
- Origin neither excludes a participating visitor nor adds a nonparticipating character automatically.
- Characters-page Edit on timeline opens a temporary row on the selected timeline, including for a character from another universe.
- Visitor-origin navigation opens the same character on their origin timeline. Both paths reuse the temporary target without creating entries or saving visibility.
- A first appearance/event establishes participation. Removing the last entry removes an ordinary row; an explicitly focused editing row remains for that visit. Changing tabs or workspace clears the temporary target.
- The Characters page shows originating characters and current participants, with the existing checkbox for other characters in the franchise.
- Participation updates from current entry state. Do not restore universe_characters, Show/Hide controls, default appearances or separate visibility writes.

Regression checks to retain:

1. A fresh character has no ordinary row; Edit on timeline opens a temporary blank row. Leaving without saving does not establish participation.
2. Saving a first appearance or event retains the row after navigation. Removing one kind of entry preserves the row if the other remains.
3. Removing the last entry removes an ordinary row, while a focused editing row lasts only for the current visit.
4. A shared project starts blank when linked to another universe. Creating, editing or deleting a cell there does not affect another universe.
5. Visitors remain valid. TVA footage does not require a Loki column on MCU.
6. Removing a project deletes only the selected timeline's entries. Relinking starts blank; other timelines and the project record remain intact.
7. Global character/project deletion removes its related entries. A universe with origin records or timeline project links remains protected.
8. Read/save failures show errors; overlapping cell mutations remain blocked.

## Next passes, in order

### 1. Additional appearance and event types

- Wait for the user's list, especially multiverse-related cases, before deciding the implementation.
- For each proposed type, establish its meaning, an example, whether it is an appearance or event, and whether it changes continuity or only the marker.
- Determine which properties need to coexist. The current model allows one appearance and one event per cell; revisit that only if the supplied examples require it.
- Update TypeScript values, editor choices, database constraints where applicable, and visuals together.
- Preserve universe-specific entries, automatic participation and visitor-origin navigation. Do not add variant or travel tables without a concrete need.

### 2. Character status and continuing lifelines — deferred until agreed

- The user wants a visible status indication beside the name and/or a continuing lifeline for characters who have not died by the relevant point in chronology.
- Earlier requested symbols: a cross for deceased, a question mark for unknown, and no mark otherwise. Final visual treatment remains open.
- Agree how death, revival, blip, return, footage and flashbacks influence status. Missing appearances are not proof of death, and footage is not proof of current survival.
- Settle how status follows chronological order and how it behaves across universe timelines. A timeline-local event must not accidentally change every timeline's status.
- Revisit extending the final connector towards the latest project only after those rules are clear.
- This work may be deferred while appearance/event types are implemented; it is not a prerequisite for discussing that list.

### 3. Functional and visual refinement

- Refine icons, shapes, colours, spacing, focus/hover feedback, editor positioning and narrow-screen behaviour.
- Check keyboard access and loading/empty/error states.
- Revisit grouping, sorting and filtering for hundreds of characters when the user defines the controls. These are presentation choices, separate from participation data.
- Validate representative timelines before bulk population.

### 4. People, crew and credits

- Keep the previously requested contributor/role/project work after timeline functionality and refinements. Use the smallest useful model when that pass begins.

## Live database access and reference maintenance

- The user now wants to connect Supabase through MCP for reading the live database. Setup instructions have been researched; authentication and connection are not yet confirmed.
- Prefer a connection restricted to this project with read_only=true. Keep database modifications in the existing user-applied workflow.
- Once connected, inspect table definitions, keys, foreign keys, indexes, nullability, functions and policies; reconcile docs/supabase/schema.sql and functions.sql with observed metadata.
- Retain a versioned schema reference. Prefer a schema-only database export over hand-maintaining an incomplete reconstruction; a snapshot does not need to be executed by the app to be useful.
- Keep the current outdated label until the reference has been reconciled. Do not claim that inferred definitions are a live export.
- A migration history can be introduced separately when useful; no CLI/Docker setup or migration-framework conversion is required for this pass.
- cross-universe-pass-guide.md is historical. Current source, this plan and the latest chat decisions take precedence.

## Population and public release

- Finish multiverse support, appearance/event behaviour and functional/visual refinements before bulk timeline population and outreach.
- Before public deployment/outreach, replace public write policies with suitable editor/viewer access and verify table/RPC permissions.
