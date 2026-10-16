# Timeline Studio development plan

Updated 16 October 2026 after reviewing the public-preview/viewer proposal against v0.3.3, the current source and live database permissions. TypeScript, lint, focused continuity checks and a Vite production build pass. The latest Vision styling, tooltip and comment cleanup is implemented. This review changes documentation only.

## Working agreement

- Keep implementation instructions, code and concise learning explanations in chat. The user applies application and database changes. Documentation may be updated directly.
- Ask clarification questions in the final chat response so the user can answer in a later message. Avoid disappearing question prompts.
- Finish required functionality before extras. Clarify new behaviour or scope when it is not already agreed.
- Supabase is the source of truth. Files under docs/supabase are reference snapshots, not automatically applied migrations or complete live exports.
- The current checkout is C:/Users/matbu/Documents/Projects/Fictional-Media-Timeline-Viewer.

## Current baseline: v0.3.3

- Franchise/universe and character/project create, edit and delete controls are implemented.
- Characters and projects require origin/primary universes; universes require a local name and can optionally have a code.
- Projects can be linked to multiple timelines, reordered independently, removed from one timeline, or deleted globally. Projects without a timeline link remain accessible through the existing-project picker within their primary universe's franchise.
- Each appearance and event belongs to one timeline universe. All entry-service reads, creates, updates, deletes and event upserts include that universe.
- Automatic participation, visitor-origin navigation, temporary editing rows, focus/highlighting and the pending-write guard remain implemented.
- Application types, services, TimelineGrid calls and participation queries reflect the new scope. Project-removal confirmation explains that the selected timeline's entries are deleted and relinking starts empty.
- Both TypeScript configurations and lint pass on the implemented source. Earlier tests of the proposed service changes covered universe/project isolation, event upsert identity, event-only participation, last-entry removal and error propagation.
- The initial live inspection on 15 October confirmed 7 public application tables, 26 named table constraints, 7 RLS policies and 2 application functions. The additional-type pass below subsequently added one appearance check. Both entry tables have required universe_id, the intended keys and validated composite foreign keys with ON DELETE CASCADE. No entries lack a matching universe-project link.
- docs/supabase/schema.sql and functions.sql now reflect the live metadata. They are documented reference snapshots, not full pg_dump backups or migrations. No database changes or destructive runtime tests were performed.

## Product rules

- Every character and project has an origin universe, including universes without an official designation or universes destroyed in the story.
- Keep a required local universe name and optional code. Main Continuity is acceptable for a franchise with one continuity; a code can be the local name if there is no official name.
- Compact visitor labels prefer a nonblank code, then name, then a readable fallback. Headings/selectors can retain the local name. Origin navigation currently stays within the selected franchise.
- Variants are versions from different universes. Keep distinct character IDs; do not introduce a same-origin variant system, numerical cap or new uniqueness constraint without a concrete requirement. The live characters table has no alias/origin unique constraint or standalone unique index beyond its id primary key.
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
- Read-only inspection now confirms the applied keys, nullability and deletion rules. There are currently character/project appearance pairs recorded in multiple universes, and neither entry table has orphaned timeline links. Cascading deletions were verified from validated constraints, not by deleting test data.
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

## Feature roadmap retained alongside public-preview preparation

### 1. Additional appearance and event types — completed in v0.3.3

Reviewed the user's implementation on 15 October:

- The appearance union and editor now offer standard, flashback, footage, depiction, vision, afterlife and non_chronological. Depiction combines statue/image/photo. Keep one appearance category per cell.
- The user simplified the selection rule: switching to any non-standard type detaches it by default, including flashback, footage and vision. The existing toggle can reconnect it. Selecting the already active type preserves a manual override, and switching to Standard preserves the current attachment setting.
- This is an editor selection default. Existing rows are not rewritten and the database still defaults is_detached to false when creating a standard appearance.
- Non-chronological appearances do not add scene ordering. Detached depictions, visions and afterlife appearances do not start or extend a continuity segment, but still establish timeline participation.
- Unknown status is available as an explicit ? event. It ends known continuity at the selected at/after position without declaring death. A later connected appearance can resume continuity.
- No global status inference, name-side status badge or final-line extension has been added.
- The original first-connected-appearance arrow remains. Multiverse entry/departure events are deferred and optional; retain one event per cell.
- Live validated database checks match all seven appearance choices and all five event choices, including vision and unknown. Universe-specific keys and cascading project-link foreign keys remain in place.
- Both TypeScript configurations and lint pass on the user's current source. Focused checks cover detachment for all non-standard types, manual attachment, preservation when reselecting a type, unknown at/after, later resumption and existing event behaviour. No database rows were modified during review.
- Visual cleanup confirmed on 16 October: Vision uses a small eye marker, appearance tooltips replace underscores and separate the detached label, and the invalid radius declaration has been removed.
- Lifeline comments now describe displayed continuity without inferring survival or claiming that only the first appearance can start a segment.
- The schema reference records the observed checks. The user has applied the code and database changes; the assistant has updated documentation only.

### 2. Character status and continuing lifelines — deferred until agreed

- The user wants a visible status indication beside the name and/or a continuing lifeline for characters who have not died by the relevant point in chronology.
- Earlier requested symbols: a cross for deceased, a question mark for unknown, and no mark otherwise. Final visual treatment remains open.
- Agree how death, revival, blip, return, unknown, afterlife, depictions, non-chronological appearances, footage and flashbacks influence derived status. Missing appearances are not proof of death, and footage is not proof of current survival.
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

- Supabase MCP is connected. The inspected project was matched to the application's configured Supabase URL.
- Inspection used read-only SELECT queries. The connected plugin also exposes write-capable tools; do not confuse our read-only workflow with verified server-enforced read-only permissions. Database modifications remain in the established user-applied workflow.
- schema.sql records the 7 public application tables, columns, defaults, identity modes, named constraints, RLS policies and table privileges. functions.sql records both live function bodies and their execution grants.
- The references were generated from catalog metadata on 15 October, not inferred from the frontend. They omit data, sequence state/ACLs, default/schema/role ACLs, extensions, managed schemas and operational settings; they are not complete restore scripts.
- Keep these references versioned and refresh them after relevant database changes. Prefer a schema-only pg_dump/Supabase CLI export when a full reproducible export is needed. No CLI/Docker setup or migration-framework conversion is needed for this documentation update.
- Both application functions use SECURITY INVOKER and an empty search_path. PUBLIC has no function EXECUTE grant; postgres, anon, authenticated and service_role have explicit execution grants.
- All 7 tables have RLS enabled, with the existing permissive prototype policies and broad grants. Record their actual state; access hardening remains a separate pre-release task.
- cross-universe-pass-guide.md is historical. Current source, this plan and the latest chat decisions take precedence.

## Verification after the default correction

- Rechecked the live database on 15 October: appearances.appearance_type now defaults to lowercase 'standard'. The user has applied the correction, and schema.sql has been reconciled with it.
- Existing appearance values remain supported lowercase values. Both entry tables still have their validated universe-specific keys and cascading link constraints, with no orphaned timeline links.
- Both TypeScript configurations and lint pass for the current application. The review did not write to the database.

## Public-preview proposal reviewed on 16 October

Source reviewed in full: C:/Users/matbu/Documents/Projects/PUBLIC_PREVIEW_AND_VIEWER_PLAN.md. Treat it as a product proposal, not authorization to implement or publish everything it lists. The user has further requested changes to describe before the next pass is fixed.

### What the review established

- The Studio/viewer split fits the existing goal. Keep one React/Vite application and shared timeline data/rendering; no second database, custom backend or wiki system is needed for the first preview.
- App.tsx currently switches views using React state. There is no router, owner sign-in or viewer permission mode. A full routing rewrite is not a prerequisite; decide URL sharing and Studio entry deliberately when needed.
- Timeline cells currently create, edit and delete entries. Viewer mode must remove those interactions as well as management navigation, temporary editing prompts and empty-cell editing cues.
- Origin links and row focus already exist. Public character exploration should use a separate selection from the existing editing target, whose behaviour includes opening temporary blank rows and remounting the timeline.
- A compact character panel can derive a journey from the selected timeline's existing projects, appearances and events. Label counts and first/latest appearances as timeline-local; do not imply global character status or a complete cross-universe history.
- The proposal calls the ordering field timeline_order; the actual field is universe_projects.timeline_position. Release-order browsing remains deferred because sorting columns also affects the current continuity calculation.
- All seven application tables have RLS enabled but still have permissive FOR ALL prototype policies and broad anon/authenticated grants. Both project-mutating functions remain executable by anon and authenticated and run as SECURITY INVOKER.
- Security Advisor returned no notices during this review. That does not establish the intended viewer-only access: direct catalog inspection confirms public writes remain permitted.
- Existing narrow-screen layout rules, page title and favicon provide a starting point. Public copy, legend, keyboard/touch explanations, a deliberate initial timeline and browser checks still need attention.
- The current TypeScript/lint checks, continuity fixtures and Vite production bundle passed. The bundle was emitted to a temporary directory; no deployment or browser-based production smoke test was performed. Git deployment connectivity was not verified.

### Proposed preview sequence — subject to the user's remaining requests

1. Resolve the user's additional priorities. Fit genuinely necessary editing or continuity fixes into a bounded pass; retain the rest of this feature roadmap rather than quietly dropping it.
2. Owner access and database permissions. Recommend one manually provisioned Supabase Auth account with email/password, no public signup, and write policies restricted to that owner's user ID. Configure table grants and mutation-function execution together, and verify anonymous/non-owner denial plus owner success. Do not authorize writes merely because any user is authenticated.
3. Viewer/Studio presentation. Default public visitors to viewing, retain the existing editor for the owner, and provide a compact introduction, complete legend and understandable marker details. Keep the current arrow and all seven appearance/five event types. Avoid a separate marketing site.
4. Character exploration. Select/highlight a row and show alias, name, origin, timeline-local appearances and events in a small panel. Retain origin navigation with an honest empty state when no origin-timeline entries exist. Project focus is a later enhancement unless the user prioritises it.
5. Preview readiness and deployment. Curate a coherent sample chronology and useful visitor-universe examples, verify loading/errors/universe switching and keyboard/touch access, finish preview/fan-project wording and metadata, test anonymous/owner access and any routed-page refresh, then deploy. Vercel is the default recommendation for the current static Vite setup; confirm repository access and deployment settings at that stage.

Keep passes independently reviewable and continue the established chat/code/user-applies workflow. The sequence above is a recommendation, not an approved expansion into every viewer idea.

### Content and release decisions still needed

- What are the additional things the user wants before viewer work?
- May all existing timeline data be publicly readable, or must incomplete/test universes remain private? Agree this before SELECT policies. Hiding a dropdown option is not a publication permission.
- Choose the most complete initial timeline and a manageable preview dataset; the current alphabetic/code-based first selection is an editing convenience.
- A preview frontend using the live Supabase project still changes live data through owner edits. Branch/hosting preview deployments do not create isolated database data. Use disposable or separate test data when future changes require it; do not build a large release pipeline now.

### Work that remains on the broader roadmap

- Character name-side status indicators and continuing lifelines, once their chronology/universe semantics are agreed.
- Further functional and visual refinement; grouping, sorting, search and filters as data volume makes them useful.
- People, crew and credits after the timeline work.
- Optional multiverse entry/departure events and any force-deletion flow only when a concrete requirement is agreed.
- Project exploration, release-order browsing and analytics remain candidates, not automatic preview prerequisites.
- A public preview can precede these features and v1. Replace public write access before any public deployment. Keep bulk population, feedback and outreach aligned with the preview's actual readiness.

References checked for this review:

- [Supabase row-level security and grants](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase password authentication](https://supabase.com/docs/guides/auth/passwords)
- [Supabase signup configuration](https://supabase.com/docs/guides/auth/general-configuration)
- [Vite static deployment guidance](https://vite.dev/guide/static-deploy.html)