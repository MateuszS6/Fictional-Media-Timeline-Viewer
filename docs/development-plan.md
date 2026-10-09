# Timeline Studio development plan

Updated 8 October 2026. This plan tracks the functionality needed to manage the timeline data from the app. Keep each pass focused on the required user-facing functionality and verify it before starting the next pass. Agree on unclear behaviour before implementation, and provide code for the user to apply with concise explanations of unfamiliar concepts. Update documentation directly when requested; do not apply application or database changes on the user's behalf under this learning workflow.

## Current baseline

- Franchises and universes can be added, edited, and deleted from Workspaces. The sidebar selects the active franchise and universe.
- Characters can be added, edited, deleted, and shown or hidden on a universe timeline.
- Projects can be added, edited, deleted, and reordered within the selected universe. Project details are shared, while chronology order belongs to each universe.
- The timeline can edit standard, flashback, and footage appearances, plus death, revival, blip, and return events.
- Timeline characters come from explicit `universe_characters` membership, not an origin-universe filter. Preserve this: an MCU character can appear as footage in Loki on the TVA timeline without adding Loki to the MCU timeline.
- Supabase is the source of truth. The checked-in `supabase/schema.sql` is not treated as the live schema.
- The current source includes the workspace review corrections and passes lint and both TypeScript checks. Live behaviour still needs the user's verification.
- The last confirmed live deletion rules set character origins/project primary universes to null and cascade universe membership links when a universe is deleted. The next pass changes these rules; the new SQL has not yet been applied or verified against Supabase.

## Agreed direction and open choices

- Every character should have an origin universe; every project should have a primary universe. A universe needs a descriptive name, but an official designation/code is optional. A destroyed universe remains a universe record.
- Origin/primary universe and timeline membership are independent. Changing one must not silently change the other, create appearances, or copy a character/project.
- Normal universe deletion should be blocked by originating characters, primary projects, or any character/project timeline memberships. Use database foreign keys to enforce this consistently.
- Repair older null origins/primary universes by assigning their actual universe before enforcing required references. Never guess an origin or remove a retained record as an automatic repair. This supersedes the earlier plan for a permanent unassigned-record workflow.
- Force deletion is deferred by recommendation, pending the user's choice. If added, define ownership and scope first: delete records originating/based there only if explicitly intended, remove that universe's memberships, and preserve visiting characters and shared projects based elsewhere. Deleting an originating record can affect appearances and links in other universes, so the confirmation must explain that. Do not apply blanket cascading deletion to all visiting/shared records.
- Each variant is a distinct character ID. Use origin labels to distinguish variants from different universes. Multiple variants can share an origin, so alias plus origin is not a complete variant identity. Keep existing uniqueness rules until the live indexes and the required same-origin cases have been checked; use a short alias qualifier when needed in the meantime.

## Development passes

### 1. Franchise and universe management — implemented; live verification pending

- Add, edit, and delete franchises and universes from the dedicated Workspaces view.
- Preserve selection after edits, select newly created workspaces, and choose an available workspace after deleting the selected one.
- Review corrections are present: conditional dropdown placeholders, Edit franchise, the table container class, foreign-key error handling, the asynchronous save callback type, and consistent list sorting.
- Verify those behaviours in the running app. Universe deletion protection is revised in pass 2 below.

### 2. Cross-universe management — implementation guide prepared

Follow [the staged implementation guide](cross-universe-pass-guide.md). The guide's proposed application changes were checked as temporary copies; they have not been applied to the app. Its SQL has not been executed against Supabase.

#### 2A. Required origins and safe deletion

- Audit and restore existing null character origins and project primary universes.
- Change all four universe foreign keys to `ON DELETE RESTRICT`: character origin, project primary universe, character timeline membership, and project timeline membership.
- Require character origins/project primary universes with `NOT NULL` after the audit is clean. Remove the Project form's Unassigned option and match the TypeScript types to the database.
- Update deletion wording to explain that referenced universes cannot be removed. Keep franchise deletion blocked while it contains universes.

#### 2B. Visiting characters and readable identities

- Keep character management on the Characters page. Show home characters and characters already linked to the selected timeline; allow other characters in the selected franchise to be included in the list.
- Reuse Show/Hide to control membership independently of origin, with no invented appearance.
- Display origin names/codes in the character list and timeline. Use text plus a subtle colour distinction for visitors, while preserving alphabetical ordering and character IDs.
- Validate the MCU/TVA footage example. Do not add a project to a character's origin timeline just because that character appears in it.

#### 2C. Existing project links

- Offer projects from the selected franchise's primary universes through Add existing project, excluding projects already linked to this timeline.
- Link the existing project at the end without changing its title, date, primary universe, appearances or events. Reuse the current position editor for reordering.
- Remove from timeline deletes only the membership. Permanent Delete remains a separate action affecting the project everywhere.
- Projects with no timeline memberships remain discoverable through their primary universe's franchise and can be linked again for editing/deletion. A project with an origin but no memberships is different from an unassigned project.
- Keep per-universe chronology ordering and prevent concurrent project additions from choosing the same position.
- Verify 2A–2C before extending appearance/event behaviour.

#### 2D. Appearance/event behaviour and types

- Preserve current shared character-project appearances/events initially. They are not currently keyed to a universe. Confirm the desired behaviour when the same project is linked to multiple universes before changing that model.
- Prevent overlapping cell saves from overwriting newer changes; event type followed quickly by event position currently risks resending the old type.
- Add the appearance and event types the user needs, aligned with live database accepted values.

### Later timeline refinements

- Add a small status indicator beside a character's name: a cross for deceased, a question mark for unknown, and otherwise no icon. Agree on how status is recorded or derived before implementing it. Footage/flashbacks do not establish that a character is alive, and revival must be accounted for. Missing recent appearances alone should not determine status.
- Consider clicking a visiting character to navigate to their origin universe and focus their row. Decide how this behaves if that row is hidden or the origin timeline has no projects; do not silently change persistent membership merely to navigate.
- Revisit ongoing lifeline connectors after status and event semantics are settled.

### 3. People, crew, and credits

- Add the people and credit records needed to associate contributors and roles with projects.
- Choose the smallest data model and management flow that supports the intended credits display.

### Before making the app public

- Replace the current public Supabase access policies with appropriate access controls and verify the app's database permissions, including RPC functions.
