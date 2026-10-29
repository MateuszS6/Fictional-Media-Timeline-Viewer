# Timeline Viewer & Studio — design direction

Agreed 23 October 2026; refined 29 October 2026. This is a working direction, not a final brand or a claim that every change below is already implemented.

## Purpose and character

A personal tool for building fictional timelines and a public viewer for exploring them. It should feel like an information tool made for fictional/cinematic worlds, with some character and theme. Prioritise readable timelines over decoration.

## Layout

- The timeline is the main surface and uses the available page width.
- Put branding and Studio access in the existing top bar. In the agreed browsing pass, use compact breadcrumbs below it inside a franchise.
- Studio page navigation is horizontal: Timeline, Characters and Projects within an opened universe. Franchise and universe management lives beside the corresponding cards.
- Current interim timeline styling uses a thin border, 8px corners and a 12px outer gutter to relate to the management surfaces. The user is not yet satisfied with the overall visual identity; broader redesign remains open.
- Keep navigation outside the grid. Put the timeline title, short description and Legend & help button in one compact header; put interaction instructions inside help.
- Keep the compact timeline header above the lightly framed grid. Preserve ordinary management-page padding and the small allowance after the final grid column for boundary events.
- Use thin, restrained scrollbars on scrolling surfaces while preserving direct horizontal navigation.
- Keep character labels and project headings sticky while the timeline scrolls.
- Use horizontal wrapped project names. Allow enough height for full titles; do not hide long names with ellipses.
- Target 44px minimum rows and 104px project columns. Names may wrap and increase a row's height.
- On narrow screens, controls wrap and the timeline scrolls horizontally. Preserve legibility rather than shrinking the whole timeline to fit.
- The agreed starting page uses franchise cards. Viewer opens a single published timeline directly; otherwise it shows universe cards. Studio always shows universe cards to expose management actions.
- Replace the franchise dropdown with All franchises and a franchise breadcrumb. Keep the universe dropdown only when multiple selectable timelines exist. Explicitly returning to universe cards must not redirect back to a single timeline.
- Initial cards use names, optional universe codes and existing restrained styles. Studio adds visibility and management actions.
- The 29 October proposal features Marvel at the top of the Viewer entry with a larger card, a Featured label and a restrained red-to-dark CSS gradient; other franchises follow below. Studio retains uniform cards. Broader franchise/universe themes and artwork follow later.
- Browsing and its review corrections are applied. The next prepared pass gives franchise/timeline destinations real links, refresh restoration and Back/Forward support. Application code remains user-applied.

## Colour and typography

- Continue with dark neutral surfaces, strong primary text and readable secondary text.
- Use the existing restrained link/focus accent consistently for this pass.
- Franchise-specific accents are a later enhancement. Preserve symbol meanings across all franchises.
- The red T logo is temporary; do not treat it as a final brand decision.
- Use the current system font stack, a clear heading hierarchy and compact but readable labels. Final font/icon choices can follow real visual references.
- Avoid a dependency, theme framework or image pipeline just for this pass.

## Timeline symbols

- Share actual marker rendering between timeline cells and the legend.
- Use small local SVG event symbols with consistent geometry, avoiding font-baseline offsets or per-glyph CSS nudges.
- Standard appearances are simple filled circles. Keep distinguishable shapes for other categories.
- Show an at-event inside a connected standard appearance. Keep separate markers for detached or specially shaped appearances so neither meaning disappears.
- Show event-only and after-event badges with a small square outline and a symbol, distinct from appearance circles.
- Keep after-events at the project boundary, including after the final project.
- Retain the first-connected-appearance arrow.
- Use 2px lifelines, centred on markers. Visual thickness does not change continuity rules.
- Faded appearances are detached. They still establish participation but do not start or extend a lifeline.
- A line endpoint alone does not mean death. Global/current character status is not inferred by this visual pass.
- Final custom appearance, event and utility icons are still open design work.

## Interaction and accessibility

- Viewer entries open details on click/tap or Enter/Space; empty cells do not edit.
- Preserve the Studio's existing editing behaviour. A later phone pass must expose its right-click editor through an explicit touch-accessible control.
- Verify grid swiping, comfortable tap targets, sticky labels, popups, portrait/landscape and pinch zoom on real phones before broad outreach.
- Provide clear focus outlines and descriptive names for controls.
- Legend & help is available on demand. Explain every appearance/event type, attachment, arrow, chronology, visitor origins and interaction.
- Reuse the current popup's viewport positioning, outside-click dismissal, Escape and focus return. Give the legend a separate fixed heading and scrolling body so samples cannot overlap the heading.
- Handle long names, dense timelines, empty results, loading and failures.
- Use text/shape alongside colour for meaning.
- A small lock beside Private identifies an unpublished timeline in Studio. Keep the card icon decorative for assistive technology, with the visible word providing its meaning. Ordinary native select options use plain text only; do not put spans or SVGs inside them. Final icon styling can be unified later.

## Character exploration

- Open details from a character name in an on-demand right-side panel; use a full-width modal overlay on narrow screens. Keep this shared between Viewer and Studio.
- Show the current timeline's recorded history and counts only, together with identity and origin information. Browsing must not reset the grid or edit participation.
- Cross-universe travel, combined journeys and global status require their own agreed rules; they are deferred beyond this panel pass.

## References

- [VoltAgent DESIGN.md collection](https://github.com/VoltAgent/awesome-design-md): inspiration for recording a coherent visual language.
- [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines): interaction, accessibility and responsive-quality reference.

Apply relevant principles to this app. No specific third-party brand style has been selected.






