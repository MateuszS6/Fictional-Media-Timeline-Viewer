# Timeline Studio development plan

Updated 18 October 2026 after reviewing the user's v0.4.0 owner-access implementation and live permissions. Owner access and its styling corrections are implemented. Selective publication and the public viewer have been prepared and tested for the user to apply; they are not live yet.

## Working agreement

- Keep implementation instructions, code and concise learning explanations in chat. The user applies application and database changes. Documentation may be updated directly.
- Ask clarification questions in the final chat response so the user can answer in a later message. Avoid disappearing question prompts.
- Finish required functionality before extras. Clarify new behaviour or scope when it is not already agreed.
- Supabase is the source of truth. Files under docs/supabase are reference snapshots, not automatically applied migrations or complete live exports.
- The current checkout is C:/Users/matbu/Documents/Projects/Fictional-Media-Timeline-Viewer.

## Current baseline: v0.4.0

- The Studio requires a confirmed owner account. Public signup is disabled; anonymous users have no application-table access, and authenticated non-owners are excluded by row-level policies. All universes remain private until selective publication is implemented.
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
- schema.sql records the 7 public application tables, columns, defaults, identity modes, named constraints, RLS policies and table/sequence privileges. functions.sql records the three live function bodies and their execution grants, including is_studio_owner().
- The references were refreshed from catalog metadata on 18 October, not inferred from the frontend. They omit data, sequence state, default/schema/role ACLs, extensions, managed schemas and operational settings; they are not complete restore scripts.
- Keep these references versioned and refresh them after relevant database changes. Prefer a schema-only pg_dump/Supabase CLI export when a full reproducible export is needed. No CLI/Docker setup or migration-framework conversion is needed for this documentation update.
- All three application functions use SECURITY INVOKER and an empty search_path. PUBLIC and anon have no EXECUTE grant; postgres, authenticated and service_role have explicit execution grants. The two project-mutating functions still obey the caller's row-level permissions.
- All 7 tables have RLS enabled with one Studio owner access policy each, restricted to authenticated and guarded by is_studio_owner() for both existing and new rows. Authenticated has SELECT/INSERT/UPDATE/DELETE; anon and PUBLIC have no table grants. Authenticated has only USAGE on the five identity sequences; privileged postgres/service_role access remains.
- cross-universe-pass-guide.md is historical. Current source, this plan and the latest chat decisions take precedence.

## Verification after the default correction

- Rechecked the live database on 15 October: appearances.appearance_type now defaults to lowercase 'standard'. The user has applied the correction, and schema.sql has been reconciled with it.
- Existing appearance values remain supported lowercase values. Both entry tables still have their validated universe-specific keys and cascading link constraints, with no orphaned timeline links.
- Both TypeScript configurations and lint pass for the current application. The review did not write to the database.

## Public-preview proposal reviewed on 16 October

Source reviewed in full: C:/Users/matbu/Documents/Projects/PUBLIC_PREVIEW_AND_VIEWER_PLAN.md. Treat it as a product proposal, not authorization to implement or publish everything it lists. The user's additional priorities were clarified on 17 October: a distinctive, polished and responsive UI, custom appearance and utility icons, reorganisation of management areas outside the timeline, character status, and user-defined sorting/grouping/views.

### What the review established

- The Studio/viewer split fits the existing goal. Keep one React/Vite application and shared timeline data/rendering; no second database, custom backend or wiki system is needed for the first preview.
- At the 16 October review, App.tsx switched views using React state, with no router, owner sign-in or viewer permission mode. Owner access has since been implemented; the public viewer remains next. A full routing rewrite is not a prerequisite; decide URL sharing and Studio entry deliberately when needed.
- Timeline cells currently create, edit and delete entries. Viewer mode must remove those interactions as well as management navigation, temporary editing prompts and empty-cell editing cues.
- Origin links and row focus already exist. Public character exploration should use a separate selection from the existing editing target, whose behaviour includes opening temporary blank rows and remounting the timeline.
- A compact character panel can derive a journey from the selected timeline's existing projects, appearances and events. Label counts and first/latest appearances as timeline-local; do not imply global character status or a complete cross-universe history.
- The proposal calls the ordering field timeline_order; the actual field is universe_projects.timeline_position. Release-order browsing remains deferred because sorting columns also affects the current continuity calculation.
- At that review, all seven application tables had RLS enabled but permissive FOR ALL prototype policies and broad anon/authenticated grants. Both project-mutating functions were executable by anon and authenticated. The completed owner-access pass below replaces that prototype access.
- Security Advisor returned no notices during that review despite the prototype public writes. Advisor results alone do not establish the intended access; inspect effective privileges and policies and test role-specific reads.
- Existing narrow-screen layout rules, page title and favicon provide a starting point. Public copy, legend, keyboard/touch explanations, a deliberate initial timeline and browser checks still need attention.
- The current TypeScript/lint checks, continuity fixtures and Vite production bundle passed. The bundle was emitted to a temporary directory; no deployment or browser-based production smoke test was performed. Git deployment connectivity was not verified.

### Approved direction; work remains one focused pass at a time

1. Preserve the user's design and workflow priorities alongside preview preparation. Establish a coherent visual direction before final icon work or a broad management-layout redesign. Clarify the intended sorting/grouping/views and character-status rules when those passes begin; do not invent them now.
2. Owner access and database permissions — implemented in v0.4.0 and reviewed on 18 October. One confirmed Supabase Auth account, public signup disabled, owner-only row policies, narrowed grants and no anonymous function execution. Read-only database role checks and mocked frontend auth-flow checks pass. The two CSS corrections below have now been applied; real browser sign-in/sign-out and owner create/edit/reorder checks remain a manual smoke test.
3. Universe publication and Viewer/Studio presentation — next pass. Add the smallest useful Public/Private control per universe, private by default, with database-enforced public reads limited to published timeline content. A participating shared character/project may require readable basic details even when its origin/primary timeline is private; private appearances, events and chronology memberships must remain hidden. Confirmed: retain participating visitors' origin name/code while disabling navigation to an unpublished origin timeline. Then provide public viewing, a compact introduction, complete legend and marker details while retaining the owner editor. Keep the current arrow and all seven appearance/five event types. Split this into two passes if the policy changes need their own review.
4. Character exploration. Select/highlight a row and show alias, name, origin, timeline-local appearances and events in a small panel. Retain origin navigation with an honest empty state when no origin-timeline entries exist. Project focus is a later enhancement unless the user prioritises it.
5. Preview readiness and deployment. Curate a coherent sample chronology and useful visitor-universe examples, verify loading/errors/universe switching and keyboard/touch access, finish preview/fan-project wording and metadata, test anonymous/owner access and any routed-page refresh, then deploy. Vercel is the default recommendation for the current static Vite setup; confirm repository access and deployment settings at that stage.

Keep passes independently reviewable and continue the established chat/code/user-applies workflow. The user approved starting this sequence, not implementing every viewer idea at once. Ordinary visitors do not need accounts. The owner-access pass temporarily presents sign-in at the application entry; the public viewer is introduced with selective publication afterwards.

### Content and release decisions still needed

- Confirmed priorities: aesthetic/responsive UI and consistent custom icons; reorganisation of management pages; character status; sorting/grouping/views designed with the user. These remain real work, not discarded extras.
- Confirmed: incomplete/test universes must remain private. Publication is an explicit per-universe decision and defaults to private; hiding an option in a dropdown does not enforce privacy.
- Choose the most complete initial timeline and a manageable preview dataset; the current alphabetic/code-based first selection is an editing convenience.
- A preview frontend using the live Supabase project still changes live data through owner edits. Branch/hosting preview deployments do not create isolated database data. Use disposable or separate test data when future changes require it; do not build a large release pipeline now.

### Work that remains on the broader roadmap

- Character name-side status indicators and continuing lifelines, once their chronology/universe semantics are agreed.
- Further functional and visual refinement; grouping, sorting, search and filters as data volume makes them useful.
- People, crew and credits after the timeline work.
- Optional multiverse entry/departure events and any force-deletion flow only when a concrete requirement is agreed.
- Project exploration, release-order browsing and analytics remain candidates, not automatic preview prerequisites.
- A public preview can precede these features and v1. Prototype public write access has been removed; selective public reads and viewer behaviour must still be verified before deployment. Keep bulk population, feedback and outreach aligned with the preview's actual readiness.

References checked for this review:

- [Supabase row-level security and grants](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase password authentication](https://supabase.com/docs/guides/auth/passwords)
- [Supabase signup configuration](https://supabase.com/docs/guides/auth/general-configuration)
- [Vite static deployment guidance](https://vite.dev/guide/static-deploy.html)
## Owner-access pass implemented and reviewed on 18 October

- One confirmed Supabase Auth account exists and matches the UUID configured in is_studio_owner(). Public Auth settings confirm email sign-in is enabled, public signup is disabled and anonymous sign-in is disabled.
- is_studio_owner() uses SECURITY INVOKER, STABLE and an empty search_path. It compares auth.uid() with the configured owner UUID. No account/role table or SECURITY DEFINER helper was added.
- All seven prototype policies are gone. Each application table has an authenticated-only Studio owner access policy with the owner check in both USING and WITH CHECK. Anonymous table access and execution of all three application functions are revoked. Authenticated table grants are limited to SELECT, INSERT, UPDATE and DELETE; sequence grants are limited to USAGE.
- Read-only transactions with transaction-local authenticated claims verified that the owner sees the same row counts as the administrative baseline and a different user sees zero rows in all seven tables. The helper returned true only for the owner. Anonymous restrictions were verified from effective grants. No live mutation tests or browser sign-in were performed.
- StudioAccess wraps WorkspaceProvider, so private data loaders mount only after the database confirms owner access. Signing out removes that workspace state. Token refreshes do not unnecessarily reset the workspace, and late ownership responses cannot unlock another account's UI.
- Both TypeScript configurations, lint and the production bundle pass on the actual implementation. Mocked auth-flow checks covered initial/signed-out state, failed sign-in, owner/non-owner access, token refresh, local sign-out success/failure, stale responses, verification errors/retry and subscription cleanup.
- Styling corrections are now present: src/main.tsx imports ./styles/auth.css, the session-bar span uses min-width: 0, and the bar uses --surface-alt.
- The only Security Advisor notice was disabled leaked-password protection. This feature requires Supabase Pro or above; it is not a failure of the owner-only policies. Reference: [password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
- Live schema/function references were refreshed. The assistant changed documentation only; application corrections remain for the user to apply and no live data, accounts or permissions were changed during review.

All timeline content remains private. No publication column or public viewer has been added. The next pass adds explicit per-universe publication, database-limited public reads and a viewer without editing controls; preserve visitor participation without exposing private timeline entries. The user chose visible origin names/codes with disabled links for unpublished timelines.


## Selective publication and viewer pass prepared on 18 October

- Confirmed option 1: public timelines retain a participating visitor's origin name/code even if that origin timeline is private. Only the required character/origin metadata becomes readable; unrelated test universes and private chronology memberships, appearances and events remain hidden.
- Reuse the existing timeline interface. The viewer shows published franchise/universe choices and has a Studio entry leading to the existing owner sign-in. Owners can return to the viewer without signing out. Mode/account changes remount workspace state.
- Add universes.is_published, required and false by default, plus a Publish this timeline checkbox in the existing universe form and a visibility column in Workspaces. Publication applies to the current saved timeline; this is not a separate draft/release system.
- Add SELECT policies alongside the existing owner-only write policies. A small private.can_read_timeline(bigint) SECURITY DEFINER helper checks owner identity or the publication flag without re-entering universe row policies. It returns only a boolean, uses an empty search_path and lives outside the exposed public schema. Keep private out of the Data API's exposed schemas.
- Universe metadata can be visible for published participants' origins; every timeline-entry/membership policy independently checks timeline read permission. Do not treat readable origin metadata as permission to read its timeline.
- Reuse WorkspaceContext.canEdit for presentation and write guards. Viewer franchise queries explicitly require published universes even while the owner is signed in, and universe selection excludes unpublished metadata-only rows.
- Reuse the existing popup for read-only cell details: character, project, appearance category, attachment and event type/position. Include event-only cells, click/touch and Enter/Space activation, Close and Escape. Empty viewer cells have no editor or add-marker hover cue.
- Existing Studio click/right-click editing remains. Origin navigation is disabled for unpublished timelines in viewer mode; the existing within-franchise navigation boundary remains.
- Prepared code passed both TypeScript configurations, lint, a production build and focused mocked UI/state checks. The SQL passed local PGlite/Postgres fixtures covering all-private defaults, published reads, private origin labels, event-only characters, shared-project isolation, anonymous/non-owner write denial, owner operations and unpublishing. These checks did not alter the live database.
- The user still applies the SQL and application code from chat. After implementation, verify the live policies and use a signed-out/private browser window for public behaviour. Refresh schema/function references only after the changes are live.
- The complete legend, introductory copy, broader responsive/visual refinement, character exploration and deployment remain in subsequent preview work. Character status, custom icons and user-defined grouping/sorting retain their existing roadmap positions.
