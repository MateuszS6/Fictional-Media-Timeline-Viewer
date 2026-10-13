# Timeline Studio development plan

Updated 14 October 2026 after reviewing the user's implemented automatic participation. The user reports that the app is working. Application functionality is complete for this pass, with two minor copy corrections noted below; live database state has not been independently inspected.

## Working agreement

- Keep implementation instructions, code and concise learning explanations in chat. The user applies application and database changes. Documentation may be updated directly.
- Ask clarification questions in the final chat response, allowing the user to answer in a later message. Avoid disappearing question prompts.
- Finish required functionality before extras. Clarify new behaviour or scope when it is not already agreed.
- Supabase is the source of truth. The files under docs/supabase are reference snapshots, not automatically applied migrations or complete live exports.
- The current checkout is C:/Users/matbu/Documents/Projects/Fictional-Media-Timeline-Viewer.

## Verified current baseline

- Franchise/universe and character/project create, edit and delete controls are implemented.
- User-supplied live DB results from 10 October established required character/project origins, required universe names, optional codes, universe deletion restrictions, UNIQUE(title) on projects, and the deferrable universe_projects_position_key constraint. The latest user-maintained schema snapshot now omits the obsolete universe_characters table.
- Projects can be linked to multiple timelines, reordered independently, removed from one timeline, or deleted globally. Projects without a timeline membership remain accessible through the existing-project picker within their primary universe's franchise.
- Compact visitor-origin links, temporary target rows, row focus/highlighting, and a pending-write guard for timeline cells have been implemented.
- The temporary target now clears when changing tabs or workspace selectors. The focus-outline CSS typo has been fixed.
- Automatic participation is implemented. The Characters page now uses Edit on timeline; source and schema snapshot contain no remaining references to the old visibility table or Show/Hide service functions.
- Current source passes lint, both TypeScript configurations and a production bundle check with file output disabled. Fixture checks executed against the current participation service and row-selection code pass for project scoping, shared projects, duplicate IDs, detached footage, event-only rows, empty timelines, unlink preservation, read failures and temporary/last-entry rows.
- Reviewed the v0.3.0 origin/focus screenshots. No live database queries/writes or interactive browser tests were performed in this review.
- Two minor CharactersPage copy corrections remain for the user: add a space between the deletion message's concatenated "events" and "across" strings; give the ordinary Edit button its own accessible label rather than the Edit on timeline label. These do not block the participation flow.

## Agreed product rules

- Every character and project has an origin universe, even when that universe has no official designation or is destroyed in the story.
- Keep a required local universe name and optional code. Main Continuity is acceptable for a franchise with one continuity; a code can be used as the local name if there is no official name.
- Compact visitor labels prefer a nonblank code, then name, then a readable fallback. Headings/selectors can retain the local name. Origin navigation currently stays within the selected franchise.
- Variants are versions from different universes. Keep distinct character IDs; do not introduce a same-origin variant system, numerical cap or new uniqueness constraint without a concrete requirement. The supplied constraints did not establish the complete set of standalone unique indexes.
- Franchise membership does not automatically add projects to every universe chronology. Loki belongs on TVA; MCU footage characters can appear there without adding Loki to the MCU timeline.
- Retain one appearance and one event per character-project pair. A shared project shares those entries across its linked timelines; ordering remains specific to each timeline. No additional universe-specific appearance tables are planned.
- Normal universe deletion must stay blocked by originating characters, primary projects and project timeline links. The retired character-visibility table is no longer part of the model.
- Force deletion remains deferred. If introduced, agree on its scope and effects on other timelines; visiting characters must not be deleted merely because the visited universe is removed.

## Completed application pass: automatic participation

Approved on 11 October; implementation reviewed on 14 October:

- Ordinary timeline rows are derived from appearances OR character events in that timeline's projects. Include event-only characters, footage and detached appearances.
- Origin does not filter a participating visitor out. Origin alone does not put a nonparticipating character on a timeline.
- Characters-page Edit on timeline opens a temporary row on the currently selected timeline, including for a character from another universe.
- An origin link opens the same character on their origin timeline. Both navigation paths reuse the existing temporary target, without creating appearances or saving visibility.
- Saving a first appearance/event makes the character an ordinary participant. Removing their last entry removes the ordinary row; an explicitly focused editing row stays until leaving that visit.
- The Characters page continues to show originating characters and current participants, with the existing checkbox to include other characters in the franchise.
- Row inclusion is derived from current appearance/event state, so it updates immediately after edits without a separate visibility write or refresh.
- Obsolete visibility methods, controls and schema-snapshot declarations have been removed. Do not restore them from older instructions.
- The user's snapshot records removal of public.universe_characters; this review did not independently query the live catalog. The application no longer reads or writes that table. Its former selections are unnecessary because actual appearances/events determine participation.
- No new table, RPC, default appearance, grouping/filter system or appearance type is part of this pass.

Regression checks to retain:

1. A fresh character does not appear in an ordinary timeline; Edit on timeline opens a temporary blank row on the selected universe.
2. Save one appearance, leave and return: the row remains. Leave without saving: it does not remain.
3. A character with only an event is included. Deleting one kind of entry must not remove a row that still has the other kind.
4. Removing the final entry removes an ordinary row; a focused empty editing row lasts only for that visit. Changing tabs clears the temporary target.
5. TVA footage remains on TVA without creating a Loki column on MCU. Shared projects include the same participating characters and cell data in both timelines.
6. Unlinking a project removes its contribution to that timeline's rows while preserving the project and its entries for other timelines.
7. Save/read failures show errors and do not become successful empty results. The pending-write guard continues to block overlapping cell actions.
8. After visibility-table cleanup, its old selections cannot block deletion of an otherwise empty universe. Real origin/project references still block deletion.

## Following passes, in order

### 1. Appearance/event types and lifeline/status behaviour

- The user will specify additional types after automatic participation works.
- Update TypeScript values, editor options, database accepted values and marker visuals together.
- Decide which appearance properties may coexist before changing the single type field.
- Agree on connector and status semantics. Footage, flashbacks and missing appearances must not be treated as proof that a character is alive.
- Add the requested name-side status indicator: cross for deceased, question mark for unknown, nothing otherwise.
- Revisit presumed ongoing continuity and extending the final connector after status/event semantics are settled.

### 2. Functional and visual refinement

- Refine icons, shapes, colours, spacing, focus/hover feedback, editor positioning and narrow-screen behaviour.
- Check keyboard access and loading/empty/error cases.
- Revisit grouping, sorting and filtering for hundreds of characters when the user defines the controls. These are presentation choices, separate from canonical participation data.
- Validate representative timelines before bulk population.

### 3. People, crew and credits

- Keep the previously requested contributor/role/project work after the timeline functionality and refinements. Use the smallest useful model when that pass begins.

## Population and public release

- The aim is to finish multiverse support, appearance/event behaviour and functional/visual refinement before bulk timeline population and outreach.
- Before public deployment/outreach, replace public write policies with suitable editor/viewer access and verify table/RPC permissions.

## Reference maintenance

- Keep schema/function references under docs/supabase. Prefer a schema export over manually reconstructing all constraints, indexes, functions and policies.
- A read-only Supabase MCP connection is optional later; the user explicitly deferred connecting it.
- cross-universe-pass-guide.md is historical material. Current source, this plan and the latest chat decisions take precedence.

