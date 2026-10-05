# Timeline Studio development plan

This plan tracks the functionality needed to manage the timeline data from the app. Keep each pass focused on the required user-facing functionality and verify it before starting the next pass. Agree on unclear behaviour before implementation, and provide code for the user to apply with concise explanations of unfamiliar concepts.

## Current baseline

- Franchises and universes can be added, edited, and deleted from Workspaces. The sidebar selects the active franchise and universe.
- Characters can be added, edited, deleted, and shown or hidden on a universe timeline.
- Projects can be added, edited, deleted, and reordered within the selected universe. Project details are shared, while chronology order belongs to each universe.
- The timeline can edit standard, flashback, and footage appearances, plus death, revival, blip, and return events.
- Supabase is the source of truth. The checked-in `supabase/schema.sql` is not treated as the live schema.
- Current management gap: deleting a universe preserves character and project records, but some of those records become inaccessible through the current app lists. Address this first in pass 2.

## Development passes

### 1. Franchise and universe management — implemented; final verification pending

- Add, edit, and delete franchises and universes from a dedicated management view.
- Keep universes grouped under their franchise. Preserve selection after edits, select newly created records, and choose an available workspace after deleting the selected one.
- Confirmed live deletion rules: a franchise cannot be deleted while it has universes. Deleting a universe removes its timeline membership links and clears matching character-origin and project-primary-universe references. Character and project records, appearances, and events remain.
- Keep deletion outcomes explicit and handle duplicate names and database errors in plain language.
- Verify the review corrections: conditional dropdown placeholders, the Edit franchise button, the universe table container class, foreign-key error handling, the asynchronous save callback type, and consistent list sorting.

### 2. Cross-universe projects, appearances, and events — next

- First, keep retained records manageable through the existing Projects and Characters pages. Account for the case where the last universe has been deleted, so remaining records are not accessible only through Supabase.
- Distinguish a project with no primary universe from a project with no timeline links: `primary_universe_id` can be null while the project still belongs to one or more timelines.
- Make projects with no timeline links discoverable for editing, linking to the selected universe's timeline, or permanent deletion through the existing deletion flow. Reuse the stored project instead of creating a duplicate.
- Make characters whose origin universe was deleted accessible for editing and deletion. Allow their origin assignment and timeline membership to be managed independently.
- Already present: `universe_projects` lets one project be linked to multiple universes, and each link has its own timeline position. The project editor changes shared project details and its primary universe, but does not manage those additional links.
- Already present: `universe_characters` controls whether a character appears in each timeline, while `characters.origin_universe_id` records where they originated.
- Missing: the character manager only lists characters from the selected universe of origin, so it cannot add a character from elsewhere to this timeline. The timeline currently displays linked characters without distinguishing their origin.
- Audit and complete project linking across universes while keeping shared project details and universe-specific chronology. Complete retained-record access and project linking before expanding appearance and event types.
- Add foreign-origin characters to a selected universe's timeline, and distinguish origin universe from timeline membership with a subtle visual cue such as color.
- Appearances and events are currently loaded by project and keyed to a character-project pair, not to a universe. Confirm whether the same appearance/event should therefore show in every universe containing that project before changing the data model.
- Prevent overlapping saves within a timeline cell from overwriting newer changes. In particular, changing an event's type and then its position before the first save finishes can resend the old type.
- Add the appearance and event types needed for the timeline, keeping the options aligned with the live database's accepted values.

### 3. People, crew, and credits

- Add the people and credit records needed to associate contributors and roles with projects.
- Choose the smallest data model and management flow that supports the intended credits display.

### Before making the app public

- Replace the current public Supabase access policies with appropriate access controls and verify the app's database permissions.
