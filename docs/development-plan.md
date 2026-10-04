# Timeline Studio development plan

This plan tracks the functionality needed to manage the timeline data from the app. Keep each pass focused on the required user-facing functionality and verify it before starting the next pass.

## Current baseline

- The app has franchise and universe selectors, but they are currently read-only.
- Characters can be added, edited, deleted, and shown or hidden on a universe timeline.
- Projects can be added, edited, deleted, and reordered within the selected universe. Project details are shared, while chronology order belongs to each universe.
- The timeline can edit standard, flashback, and footage appearances, plus death, revival, blip, and return events.
- Supabase is the source of truth. The checked-in `supabase/schema.sql` is not treated as the live schema.

## Planned passes

### 1. Franchise and universe management — next

- Add, edit, and delete franchises and universes from a dedicated management view.
- Keep universes grouped under their franchise and preserve the current workspace selection after saves.
- Decide deletion behavior from the live foreign keys before wiring it: deleting a universe may affect project links, character links, and origin/primary-universe references; deleting a franchise may affect its universes. Make those outcomes explicit and never silently remove connected data.
- Handle duplicate names and database errors in plain language.

### 2. Cross-universe projects, appearances, and events

- Already present: `universe_projects` lets one project be linked to multiple universes, and each link has its own timeline position. The project editor changes shared project details and its primary universe, but does not manage those additional links.
- Already present: `universe_characters` controls whether a character appears in each timeline, while `characters.origin_universe_id` records where they originated.
- Missing: the character manager only lists characters from the selected universe of origin, so it cannot add a character from elsewhere to this timeline. The timeline currently displays linked characters without distinguishing their origin.
- Audit and complete project linking across universes while keeping shared project details and universe-specific chronology.
- Add foreign-origin characters to a selected universe's timeline, and distinguish origin universe from timeline membership with a subtle visual cue such as color.
- Appearances and events are currently loaded by project and keyed to a character-project pair, not to a universe. Confirm whether the same appearance/event should therefore show in every universe containing that project before changing the data model.
- Add the appearance and event types needed for the timeline, keeping the options aligned with the live database's accepted values.

### 3. People, crew, and credits

- Add the people and credit records needed to associate contributors and roles with projects.
- Choose the smallest data model and management flow that supports the intended credits display.

### Before making the app public

- Replace the current public Supabase access policies with appropriate access controls and verify the app's database permissions.
