# Timeline Viewer & Studio — design direction

Agreed 23 October 2026. This is a working direction, not a final brand or a claim that every change below is already implemented.

## Purpose and character

A personal tool for building fictional timelines and a public viewer for exploring them. It should feel like an information tool made for fictional/cinematic worlds, with some character and theme. Prioritise readable timelines over decoration.

## Layout

- The timeline is the main surface and uses the available page width.
- Put branding and Studio access in the existing top bar; put franchise/universe choices in a compact bar beneath it.
- Studio page navigation is horizontal. Use clear visible nouns: Timeline, Characters, Projects, Franchises & universes.
- Use a thin divider for the timeline scroll area, rather than a large rounded card frame.
- Keep headings, short instructions, navigation and help outside the grid.
- Keep character labels and project headings sticky while the timeline scrolls.
- Use horizontal wrapped project names for the next pass. Allow enough height for full titles; do not hide long names with ellipses.
- Target 44px minimum rows and 104px project columns. Names may wrap and increase a row's height.
- On narrow screens, controls wrap and the timeline scrolls horizontally. Preserve legibility rather than shrinking the whole timeline to fit.
- A future franchise-card entry can lead into universe browsing and then the timeline. It complements the compact selectors inside an opened timeline.

## Colour and typography

- Continue with dark neutral surfaces, strong primary text and readable secondary text.
- Use the existing restrained link/focus accent consistently for this pass.
- Franchise-specific accents are a later enhancement. Preserve symbol meanings across all franchises.
- The red T logo is temporary; do not treat it as a final brand decision.
- Use the current system font stack, a clear heading hierarchy and compact but readable labels. Final font/icon choices can follow real visual references.
- Avoid a dependency, theme framework or image pipeline just for this pass.

## Timeline symbols

- Share actual marker rendering between timeline cells and the legend.
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
- Preserve the Studio's existing editing behaviour.
- Provide clear focus outlines and descriptive names for controls.
- Legend & help is available on demand. Explain every appearance/event type, attachment, arrow, chronology, visitor origins and interaction.
- Reuse the current popup's viewport positioning, outside-click dismissal, Escape and focus return.
- Handle long names, dense timelines, empty results, loading and failures.
- Use text/shape alongside colour for meaning.

## References

- [VoltAgent DESIGN.md collection](https://github.com/VoltAgent/awesome-design-md): inspiration for recording a coherent visual language.
- [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines): interaction, accessibility and responsive-quality reference.

Apply relevant principles to this app. No specific third-party brand style has been selected.

