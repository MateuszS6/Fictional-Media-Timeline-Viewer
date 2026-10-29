# Timeline Studio development plan

Updated 29 October 2026. The browsing review corrections are applied. The user chose timeline-only sharing, is considering Vercel, and requested a featured Marvel entry with a small gradient treatment. Routing and the featured card are prepared and tested in temporary files; the user applies application changes from chat.

## Working agreement

- Keep implementation instructions, code and concise learning explanations in chat. The user applies application and database changes. Documentation may be updated directly.
- Ask clarification questions in the final chat response so the user can answer in a later message. Avoid disappearing question prompts.
- Finish required functionality before extras. Clarify new behaviour or scope when it is not already agreed.
- Supabase is the source of truth. Files under docs/supabase are reference snapshots, not automatically applied migrations or complete live exports.
- The current checkout is C:/Users/matbu/Documents/Projects/Fictional-Media-Timeline-Viewer.

## Current baseline: browsing and review corrections applied

- The app opens in read-only Viewer mode on franchise cards. A franchise with one published universe opens directly; otherwise universe cards are shown. Only explicitly published timelines are selectable; new universes default to private. Participating visitors' origin names/codes may be readable even when those origins are private, but their private timeline entries remain hidden.
- The Studio requires the configured owner account. Public signup remains disabled. Anonymous and authenticated non-owner access is limited to published content; writes remain owner-only. The Studio button opens sign-in, and the owner can return to Viewer without signing out.
- Clicking an occupied viewer cell opens read-only appearance/event details, including event-only cells. Empty cells do not edit. Studio click/right-click editing remains.
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
- schema.sql records the 7 public application tables, columns, defaults, identity modes, 27 named constraints, 14 RLS policies, table/sequence privileges and the private helper schema's usage grants. functions.sql records the three public functions plus private.can_read_timeline(bigint), with their execution grants.
- The references were refreshed from catalog metadata on 20 October, not inferred from the frontend. They omit data, sequence state, default/role ACLs, schema ACLs other than the helper schema, extensions, managed schemas and operational settings; they are not complete restore scripts.
- Keep these references versioned and refresh them after relevant database changes. Prefer a schema-only pg_dump/Supabase CLI export when a full reproducible export is needed. No CLI/Docker setup or migration-framework conversion is needed for this documentation update.
- All three public application functions use SECURITY INVOKER and an empty search_path. PUBLIC and anon have no EXECUTE grant; postgres, authenticated and service_role have explicit execution grants. The two project-mutating functions still obey the caller's row-level permissions. The private read-permission helper uses SECURITY DEFINER with an empty search_path and returns only a boolean; anon and authenticated may execute it.
- All 7 tables have RLS enabled with an authenticated Studio owner policy and a publication-limited SELECT policy each. Authenticated has SELECT/INSERT/UPDATE/DELETE; anon has SELECT only, and PUBLIC has no table grants. Authenticated has only USAGE on the five identity sequences; privileged postgres/service_role access remains.
- cross-universe-pass-guide.md is historical. Current source, this plan and the latest chat decisions take precedence.

## Verification after the default correction

- Rechecked the live database on 15 October: appearances.appearance_type now defaults to lowercase 'standard'. The user has applied the correction, and schema.sql has been reconciled with it.
- Existing appearance values remain supported lowercase values. Both entry tables still have their validated universe-specific keys and cascading link constraints, with no orphaned timeline links.
- Both TypeScript configurations and lint pass for the current application. The review did not write to the database.

## Public-preview proposal reviewed on 16 October

Source reviewed in full: C:/Users/matbu/Documents/Projects/PUBLIC_PREVIEW_AND_VIEWER_PLAN.md. Treat it as a product proposal, not authorization to implement or publish everything it lists. The user's additional priorities were clarified on 17 October: a distinctive, polished and responsive UI, custom appearance and utility icons, reorganisation of management areas outside the timeline, character status, and user-defined sorting/grouping/views.

### What the review established

- The Studio/viewer split fits the existing goal. Keep one React/Vite application and shared timeline data/rendering; no second database, custom backend or wiki system is needed for the first preview.
- At the 16 October review, App.tsx switched views using React state, with no router, owner sign-in or viewer permission mode. Owner access and the public viewer have since been implemented. A full routing rewrite is not a prerequisite; decide URL sharing and Studio entry deliberately when needed.
- At that review, timeline cells created, edited and deleted entries. The implemented Viewer now removes those interactions, management navigation, temporary editing prompts and empty-cell editing cues.
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
3. Universe publication and Viewer/Studio presentation — implemented in v0.4.1 and reviewed on 20 October. Per-universe publication defaults to private; public reads are enforced by the database. Visitors keep origin labels with disabled links to unpublished timelines. Read-only cell details reuse the shared timeline. Finish this preview stage with a compact introduction and complete legend for the arrow, connected/detached appearances, seven appearance types and five event types; include keyboard/touch guidance and narrow-screen checks. Keep final icon design and broader management redesign in the agreed visual work.
4. Character exploration. Select/highlight a row and show alias, name, origin, timeline-local appearances and events in a small panel. Retain origin navigation with an honest empty state when no origin-timeline entries exist. Project focus is a later enhancement unless the user prioritises it.
5. Preview readiness and deployment. Curate a coherent sample chronology and useful visitor-universe examples, verify loading/errors/universe switching and keyboard/touch access, finish preview/fan-project wording and metadata, test anonymous/owner access and any routed-page refresh, then deploy. Vercel is the default recommendation for the current static Vite setup; confirm repository access and deployment settings at that stage.

Keep passes independently reviewable and continue the established chat/code/user-applies workflow. The user approved starting this sequence, not implementing every viewer idea at once. Ordinary visitors do not need accounts. The public viewer is now the default entry, with a Studio button leading to owner sign-in.

### Content and release decisions still needed

- Confirmed priorities: aesthetic/responsive UI and consistent custom icons; reorganisation of management pages; character status; sorting/grouping/views designed with the user. These remain real work, not discarded extras.
- Confirmed: incomplete/test universes must remain private. Publication is an explicit per-universe decision and defaults to private; hiding an option in a dropdown does not enforce privacy.
- Choose a manageable preview dataset and the franchises/universes to publish. The agreed browsing entry starts with franchise cards rather than an arbitrary first timeline.
- A preview frontend using the live Supabase project still changes live data through owner edits. Branch/hosting preview deployments do not create isolated database data. Use disposable or separate test data when future changes require it; do not build a large release pipeline now.

### Work that remains on the broader roadmap

- Character name-side status indicators and continuing lifelines, once their chronology/universe semantics are agreed.
- Further functional and visual refinement; grouping, sorting, search and filters as data volume makes them useful.
- People, crew and credits after the timeline work.
- Optional multiverse entry/departure events and any force-deletion flow only when a concrete requirement is agreed.
- Project exploration, release-order browsing and analytics remain candidates, not automatic preview prerequisites.
- A public preview can precede these features and v1. Prototype public write access has been removed; selective public reads and focused viewer interaction checks now pass; real-browser and deployment smoke tests still remain. Keep bulk population, feedback and outreach aligned with the preview's actual readiness.

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

At the end of the 18 October owner-access pass all timeline content remained private. The subsequent v0.4.1 pass below adds publication and the public viewer. Preserve the user's choice of visible origin labels with disabled links for unpublished timelines.


## Selective publication and viewer pass — v0.4.1 implemented and reviewed on 20 October

- Confirmed option 1: public timelines retain a participating visitor's origin name/code even if that origin timeline is private. Only the required character/origin metadata becomes readable; unrelated test universes and private chronology memberships, appearances and events remain hidden.
- Reuse the existing timeline interface. The viewer shows published franchise/universe choices and has a Studio entry leading to the existing owner sign-in. Owners can return to the viewer without signing out. Mode/account changes remount workspace state.
- Add universes.is_published, required and false by default, plus a Publish this timeline checkbox in the existing universe form and a visibility column in Workspaces. Publication applies to the current saved timeline; this is not a separate draft/release system.
- Add SELECT policies alongside the existing owner-only write policies. A small private.can_read_timeline(bigint) SECURITY DEFINER helper checks owner identity or the publication flag without re-entering universe row policies. It returns only a boolean, uses an empty search_path and lives outside the exposed public schema. Keep private out of the Data API's exposed schemas.
- Universe metadata can be visible for published participants' origins; every timeline-entry/membership policy independently checks timeline read permission. Do not treat readable origin metadata as permission to read its timeline.
- Reuse WorkspaceContext.canEdit for presentation and write guards. Viewer franchise queries explicitly require published universes even while the owner is signed in, and universe selection excludes unpublished metadata-only rows.
- Reuse the existing popup for read-only cell details: character, project, appearance category, attachment and event type/position. Include event-only cells, click/touch and Enter/Space activation, Close and Escape. Empty viewer cells have no editor or add-marker hover cue.
- Existing Studio click/right-click editing remains. Origin navigation is disabled for unpublished timelines in viewer mode; the existing within-franchise navigation boundary remains.
- Prepared code passed both TypeScript configurations, lint, a production build and focused mocked UI/state checks. The SQL passed local PGlite/Postgres fixtures covering all-private defaults, published reads, private origin labels, event-only characters, shared-project isolation, anonymous/non-owner write denial, owner operations and unpublishing. These checks did not alter the live database.
- The user applied the SQL and application code. On 20 October, both TypeScript configurations, lint, the production bundle and focused mocked UI/state checks passed against the actual source. Read-only live role checks matched the expected published data for both anon and a non-owner; owner reads matched the administrative baseline. Of 17 universes, 3 were published and 2 additional private origins were readable as required metadata, with no private chronology entries exposed.
- The 14 live policies, publication default, helper definition, function grants, table grants, identity-sequence grants and all 27 validated constraints were inspected. Schema/function references are refreshed. No live rows, accounts, functions or permissions were changed by the review. The Security Advisor still reports only the previously documented disabled leaked-password protection notice.
- Follow-up source review on 23 October confirms session-bar branding and the film emoji are present. The viewer focus rule was added with an unintended :not() selector; the next pass corrects it.
- Browser sign-in/sign-out, mobile layout and publish/unpublish smoke tests remain manual checks. The active Data API exposed-schema list was not available through the inspected SQL settings; keep the private helper schema unexposed.
- The complete legend, introductory copy, broader responsive/visual refinement, character exploration and deployment remain in subsequent preview work. Character status, custom icons and user-defined grouping/sorting retain their existing roadmap positions.


## Viewer experience agreed on 23 October — implemented and reviewed on 25 October

The user wants an information tool with cinematic character, rather than a generic corporate dashboard. Refinement can continue later; the timeline must remain the focus. No concrete external visual references have been selected yet. DESIGN.md records this direction and links the reference resources discussed.

### Included now

- Replace the left sidebar in Viewer and Studio with a compact franchise/universe bar. Keep Studio navigation as horizontal buttons. Preserve publication filtering and all current permission boundaries.
- Rename the visible Workspaces navigation label to Franchises & universes. Hide the universe selector on that management page because its scope is the selected franchise and all of its universes. Internal workspace/view identifiers can remain unchanged.
- Give the timeline the available page width, separated by a thin top rule instead of a rounded card frame. Keep heading, controls, instructions and help outside the scrolling grid. Future detail panels do not require a permanent empty sidebar.
- Reduce ordinary rows from 58px to a 44px minimum; allow longer names to wrap and grow. Keep sticky character names and project headers.
- Use horizontal, naturally wrapped project headings with 104px columns. Remove the vertical text's 90px clipping limit. Extra horizontal scrolling is an accepted tradeoff for readable titles; do not silently shorten stored project names.
- Simplify standard appearances to filled dots, retain the first-connected-appearance arrow, and use 2px centred lifelines without changing continuity calculations.
- Put an at-event symbol inside a connected standard appearance. Detached and other appearance categories retain both markers, so neither category nor attachment is hidden. Event-only markers remain valid. After-events stay at the project boundary and use a small square badge, distinct from appearance dots. Reserve space after the final column so the last badge is not clipped.
- Share one small TimelineMarkers component between cells and the legend. The popup still describes both appearance and event separately; this is a display change, not a merged data model.
- Add short mode-appropriate instructions and a Legend & help button. Its scrollable popup lists all seven appearance types and five event types, plus attachment, arrow, event position, visitor origin and keyboard/touch explanations. Reuse the existing positioning, outside-click, Escape and focus-return behaviour.
- Correct the viewer-cell focus selector. Preserve ordinary Viewer click/keyboard details and existing Studio editing behaviour.

### Validation and scope

- Proposed source passed both TypeScript configurations, lint and a production build in temporary files.
- An isolated browser fixture using the actual proposed components and sample data verified full project-title wrapping, 44px rows, merged symbols, Viewer keyboard details and focus restoration, all 16 legend entries/examples, bounded desktop/phone/landscape popups and Studio franchise-page selector scope.
- No application source or live database data was changed by the assistant. The user applies the code from chat. Confirm real-data layout, editing and publication behaviour after application before marking the pass complete.
- No changes to table structure, permissions, appearance/event values, continuity semantics or character status are included.

### Retained design and navigation requests

- Franchise cards are the agreed browsing entry: choose a franchise, explore its universes, then open a timeline. Replace the franchise dropdown with All franchises and a franchise breadcrumb; retain the universe switcher only when multiple selectable timelines exist. See the 27 October pass below.
- Studio franchise and universe editing still needs a clearer hierarchy. The navigation rename and selector scope above are the first improvement; the deeper management layout should be designed with the franchise/universe browsing pass.
- Franchise-specific accents are desired later. Keep appearance/event meanings and shapes consistent across franchises. A theme must not change what a symbol means.
- The red T logo is a placeholder. Final naming/identity, logo, custom utility icons and refined appearance/event artwork remain open; avoid treating the placeholder as a final brand specification.
- Keep the compact information-first direction. Use deliberate typography, spacing, contrast and restrained cinematic accents rather than large decorative sections competing with the timeline.

### Remaining path to the public preview

1. Viewer layout and visual cleanup are implemented in v0.4.2, including the corrected heading rules and screenshot-safe Studio label. The subsequent light frame and thin scrollbars are also present.
2. Character exploration and the side-by-side facts/label-colour correction are applied and reviewed on 27 October; browsing selection remains separate from the editing/origin-focus target.
3. Franchise/universe cards and Studio organisation are applied and reviewed on 28 October. Apply the review corrections below (now present); keep the user's screenshots and README release notes current.
4. Agree and implement shareable timeline URLs, refresh restoration and browser Back/Forward. Confirm hosting plans and whether the first scope includes character links. Then curate the preview dataset and finish public/fan-project copy, metadata, loading/empty/error states, keyboard/touch and responsive checks.
5. Verify guest/owner behaviour and publication/unpublication with the applied code, confirm repository/hosting configuration, and deploy a preview. Deployment is a separate step; nothing is published by this design pass.

Character status and continuing lifelines, user-defined sorting/grouping/views, final custom icons/theming and management refinements remain on the roadmap. Their rules/design need agreement at their respective passes; they are not silently added as requirements for this pass. People, crew and credits remain after the timeline work. Optional multiverse entry/departure and force-deletion flows remain deferred.



## Visual cleanup reviewed on 25 October — implemented in v0.4.2

- The user's source contains the compact top navigation, horizontal wrapped project titles, shared marker renderer, merged at-events and legend. Both TypeScript configurations and lint pass.
- Keep the user's 44px minimum row variable, 100px minimum project-header height, detached-marker opacity and current appearance shapes.
- Remaining outer timeline space comes from main-content padding. Scope zero padding/gap to the Timeline view, keep padding on its header and status messages, and preserve the final 12px grid allowance for after-events.
- Move Legend & help alongside the timeline title/description. Move mode-specific interaction instructions into the help popup, removing the extra toolbar row.
- Put the legend heading outside a separately scrolling body. Remove its sticky positioning rather than adding stacking-order overrides.
- Replace font-based event glyphs and the shared vertical nudge with one small local SVG component. Retain the cross, clockwise/counterclockwise arrows, sparkle and question-mark meanings. This alignment fix is not a final icon/branding redesign.
- The proposed cleanup passed both TypeScript configurations, lint and a production build in temporary files. An isolated browser fixture verified desktop/phone/landscape layout, grid edges, long titles, final after-event visibility, centred SVGs, legend clipping/header stability, contents, keyboard details and focus return.
- Application code remains user-applied from chat. Only documentation was changed by the assistant; no database changes or live edits were made. Real-data review remains after application.
- Character exploration remains the next planned feature pass; status rules, sorting/grouping, franchise browsing, management layout and preview readiness retain their existing positions.



## Character exploration agreed on 25 October — implemented and reviewed on 27 October

- The user chose an on-demand side panel. It is available in Viewer and Studio, opened from a character-name button, with selected-row highlighting. Desktop keeps the timeline usable alongside it; narrow screens use a native modal dialog.
- Scope is the currently selected universe timeline only. Show alias, optional full name, origin metadata, local appearance/event counts and project-ordered entries, including detached appearances and event-only entries. At/after labels remain explicit.
- Reuse the loaded projects, characters, appearances and events. Filter by universe and character identity; do not combine same-name variants or invent a global event order.
- Browse selection is local to TimelineGrid and separate from the existing focusedCharacterId. Opening/switching/closing the panel does not remount or reload the grid or create temporary rows. Workspace changes clear selection through the existing keyed grid lifecycle.
- Reuse origin navigation and its publication/saving restrictions. Unpublished origin metadata may remain visible, but Viewer cannot open the private chronology. Counts and history update from Studio edits; deleting the last entry leaves an honest empty panel until closed, without retaining the row artificially.
- Close and Escape restore focus to the selecting name button, or the timeline if that row was removed. The native mobile dialog blocks background interactions and manages keyboard containment.
- Prepared source passed both TypeScript configurations, lint and a production build. Isolated browser checks with mocked service data covered timeline-specific counts/order, same-name variants, detached/event-only entries, private/public origins, no additional reads/writes from browsing, preserved grid identity/scroll, desktop switching, mobile focus/Escape, responsive transitions, Studio edits, last-entry/temporary-row empty states and universe reset.
- The user has applied the character-panel code. Actual source passes both TypeScript configurations, lint, a production build and the isolated sample-data browser checks described above. No live database access or mutations were needed. The assistant has changed documentation only; no new release version is assigned by this review.
- The 27 October screenshot/source review found two styling issues: undefined --border-text prevented label/helper colours, and grid-template-columns alone did not establish a grid. Prepared correction groups each label/value pair, lays the two facts side by side with wrapping on narrow widths, and uses smaller muted labels with stronger values. The user has now applied this correction; the follow-up source review confirms the grouped facts, responsive grid and valid colour variables.

### Multiversal journeys — deferred, not a preview blocker

- The user raised a future combined journey with explicit travel between universes, such as Iron Man leaving his origin timeline and returning.
- Independent per-universe project positions cannot establish that character's overall travel order. Do not infer entry/departure from visitor labels or place a timeline-local death on every universe.
- Keep origin navigation now. A combined ordered journey and any entry/departure markers need an agreed model in a later focused pass. No travel tables, markers or chronology rules are introduced by character exploration.
- After reviewing this panel, continue franchise/universe browsing and Studio organisation, followed by preview content/access checks and deployment as already planned.


## Franchise/universe browsing agreed on 27 October — implemented and reviewed on 28 October

- The user accepted the recommended franchise-card starting page, direct opening of a single published universe in Viewer, and the same franchise-to-universe hierarchy for Studio management.
- Remove the franchise dropdown. Inside a franchise, All franchises returns to the cards; the franchise name returns to its universe cards. Keep a compact universe switcher inside a timeline/management page only when more than one selectable universe exists.
- An explicit return to universe cards must stay on that screen, even for a one-universe franchise. Studio always shows universe cards after opening a franchise so its management actions remain accessible.
- Use names, optional universe codes and restrained existing styles. Show Public/Private and existing Edit/Delete actions in Studio only. Put Add franchise on the franchise screen and Add universe on the universe screen. Preserve existing forms, confirmations, reference errors and default-private publication.
- Replace the old Workspaces tab with this hierarchy; Timeline, Characters and Projects remain the Studio tabs within an opened universe.
- Keep the existing published-only franchise query and filter selectable universes independently, including for signed-in owners using Viewer. Readable private-origin metadata is not a public timeline choice.
- Start with franchise data only. Load universes when a franchise is chosen, cancel stale loads when navigating away, retry without changing the selected franchise, and block workspace navigation during saves. New franchises remain on the cards until opened.
- Reuse the existing context, services and database. No new table, auth policy, route library, artwork system, global chronology or status rule is required.
- The prepared source passes both TypeScript configurations, lint and a production build. Isolated browser checks using the real proposed App/provider/components and sample service data pass for entry/shortcut/back navigation, public filtering, stale loads, retries, desktop/phone layouts, keyboard focus, universe switching and panel reset, Studio CRUD, publication/default-private settings, reference rejection, retained failed forms and saving guards.
- The user applied the browsing pass. On 28 October, the actual source passes both TypeScript configurations, lint and a production build. Browser checks reproduced the overview-heading and universe-deletion navigation defects below. The corrected proposal passes the complete sample-data browser checks. Only documentation was edited by the assistant; application corrections remain user-applied and no live database access or mutations were performed.
- Navigation remains in-app state for now: a reload starts at franchise cards. Browser history and shareable timeline URLs remain an explicit preview-readiness decision. Artwork, final branding, global character status, sorting/grouping, people/credits and multiversal journeys retain their existing roadmap positions.


### Small corrections from the 28 October review

- App's universe-card page title currently reads selectedUniverse.name; use selectedFranchise.name so the overview is headed by its franchise.
- The reset change was applied to removeUniverse instead of removeFranchise. After deleting the selected franchise, activateFranchise(null). After deleting the selected universe, retain the franchise and select the first remaining universe ID (or null). The current version unexpectedly returns to all franchise cards when that selected universe is deleted.
- A lock plus the word Private is appropriate. In the ordinary native universe selector, replace the nested span with text only, including the word Private. On cards, keep the lock in an aria-hidden span beside the readable status text. Final SVG branding/icon work remains deferred.
- Add the missing space to the Edit button's accessible label: "Edit " + record.name.
- The proposal preserves the user's visual tweaks. Browser verification covers single-published-universe opening, explicit return to cards, Viewer publication filtering, late-load cancellation and retry, universe switching/panel reset, Studio creation/editing/deletion, publication default/toggle, linked-record rejection, retained failed forms, saving guards and desktop/phone layouts. No claims are made about live role testing in this review.
- README remains v0.4.3 with existing images. After the corrections are applied and reviewed, v0.4.4 is a suitable browsing-release number; the user will provide new screenshots.

### Next pass: shareable links and browser navigation

- Give a franchise/universe a stable address, preserve the selected destination on refresh, and make browser Back/Forward follow navigation.
- Keep links subject to the existing published/private permissions; a missing, removed or unpublished destination needs an honest unavailable state.
- Confirmed universe-level sharing first; no character IDs in shared URLs. Hosting is not yet set up. Vercel is the provisional recommendation, with account setup and deployment following the applied-code review.
- This pass does not imply global character chronology, new appearance types, a visual redesign, or deployment. Preview content/copy/metadata and final access/deployment checks follow in the existing plan.


## Routing and featured Marvel pass — prepared on 29 October

- The four previous review corrections are present: franchise overview heading, deletion-selection handling, text-only private dropdown labels, and spaced Edit accessibility labels.
- Use React Router 8.5.1 with createBrowserRouter/RouterProvider. Addresses identify a franchise and timeline by stable numeric database IDs; names may change without changing an address.
- Viewer routes: /, /franchises/:franchiseId and /franchises/:franchiseId/timelines/:universeId. Studio uses the same structure prefixed with /studio, plus /characters and /projects within a selected timeline.
- The URL supplies selected IDs and page view. Remove duplicate selected-ID state and setters from WorkspaceProvider/Context. Keep loading, save guards, errors and database services. Key the provider by mode and franchise so late loads cannot populate another franchise.
- Turn browsing and navigation controls into real links. A normal Viewer franchise-card click may replace its intermediate address with its single published timeline; explicitly returning to the franchise overview stays there.
- Keep StudioAccess's existing session/owner checks. Its requested mode comes from /studio, so direct Studio links preserve their destination through sign-in. Viewer links remain read-only even for a signed-in owner. Missing/private/invalid or mismatched franchise/universe addresses get a generic unavailable page, not a fallback timeline.
- Keep character edit/origin focus in temporary navigation state, outside the shared URL. Ordinary character-panel browsing never changes the URL. Block in-app navigation during workspace saves; this is not a general unsaved-form or hard-reload guard.
- Add the Vercel SPA rewrite in vercel.json so a direct request/refresh serves index.html. Vercel deployment is not performed by this pass. Supabase remains the backend; existing environment variable names remain VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
- Feature the published Marvel franchise at the top of the Viewer entry, with a larger card, Featured label and restrained red-to-dark CSS gradient. Put the other franchises below without duplicating Marvel. Match the franchise name case-insensitively for now; no database feature flag or artwork system is added. Studio keeps compact, uniform management cards.
- Prepared source passes both TypeScript configurations, lint and a production build. Vite reports a bundle-size advisory after adding the router (about 557 kB minified / 160 kB gzip); this does not fail the build. Consider route/code splitting during preview performance checks, without hiding the warning threshold.
- Browser fixtures use the proposed App, provider, router and StudioAccess with sample services and simulated authentication. Checks pass for direct/refresh/back/forward navigation, featured ordering, single-universe opening, explicit overview, private/invalid/cross-franchise destinations, signed-in Viewer, Studio tabs/sign-in/sign-out/non-owner behaviour, CRUD/publication, navigation during a workspace save and phone/keyboard/tap interaction.
- These are prepared changes, not applied application code or a live deployment. Review the user's implementation next, then finish preview copy/metadata/content and hosting/access smoke tests. No live database, accounts or permissions were changed.

### Touch and later design commitments

- Touch compatibility is required. The current grid uses native scrolling, Viewer cells open on tap and character details already use a narrow-screen modal. One emulated touch tap was verified in this routing pass; actual-device usability remains to be checked.
- Schedule a focused phone pass before broad outreach: comfortable tap targets, horizontal/vertical grid panning, sticky labels, popup placement, portrait/landscape and pinch zoom.
- Studio's advanced cell editor currently relies on right-click; provide a deliberate touch-accessible edit control in that phone pass instead of assuming long-press will behave consistently.
- Broader franchise/universe theming, gradients and final icons/branding remain welcome later. This pass's gradient is confined to the featured card and does not change timeline symbol meanings.

