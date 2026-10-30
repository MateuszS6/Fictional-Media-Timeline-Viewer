# Plotstrand preview branding

Prepared 30 October 2026. Plotstrand is the provisional public name; a later rename is welcome. The repository/folder name and hosting setup do not need to change with the display name.

## Assets

- `public/brand/logo.png`: 256 × 256 PNG; display at 32 × 32 in the app bar beside real text.
- `public/favicon.png`: 64 × 64 PNG for browser tabs.
- `public/apple-touch-icon.png`: 180 × 180 PNG for a saved home-screen shortcut.
- `docs/branding/plotstrand-logo-source.png`: full-size selected source, 1254 × 1254.

The blue-to-violet branching mark is a generated image, not HTML decoration. The final source has an alpha channel and transparent corners. Smaller exports retain transparency and the same artwork. Keep the image's alt text empty beside the visible Plotstrand name to avoid duplicate announcements.

Generated with the built-in image-generation tool (generate, then a transparency refinement), not the API/CLI fallback. Standard image resizing produced the smaller PNG exports; no new artwork was drawn during export.

## Typography

Manrope Variable is the body/UI face; Space Grotesk Variable is used for headings and the app name. Both are bundled locally through Fontsource. Font choices live in the two CSS variables in `src/index.css`; imports are in `src/main.tsx`. Original font licence texts are included under `public/licenses`.

## Source changes

The user has applied the font imports, CSS variables and initial Plotstrand labels. The logo integration, icon head tags, Studio label and contextual browser-title edits are supplied in chat for the user to apply. Temporary checks of the complete proposal pass TypeScript, lint, production build and browser navigation/title/phone-layout checks using sample data. Deployment and hosted checks remain outstanding.

## Generation prompt

```text
Use case: logo-brand.
Asset type: standalone transparent PNG symbol for Plotstrand, an app for exploring fictional character timelines and branching universes.
Create ONE refined, minimal, bold logo symbol: a horizontal timeline strand that curves smoothly into two parallel paths, with three simple circular story nodes. Compact square-friendly silhouette, balanced and distinctive. Two flowing paths with ample negative space; thick consistent strokes and solid circular endpoints, legible as a tiny browser favicon. A restrained smooth gradient from bright cool blue to soft violet, strong contrast on charcoal. Flat, crisp vector-like finish.
Center the symbol, filling about 85 percent of a square canvas. Genuinely transparent background.
No text, no lettering, no wordmark, no border or tile, no checkerboard painted into the image, no shadows, glow, textures, 3D, mockup, or presentation sheet. No extra decorative stars or objects.
```

## Final refinement prompt

```text
Edit this logo asset only to remove its background. Keep exactly the same branching shape, proportions, blue-to-violet gradient and position. Make every pixel outside the logo genuinely transparent (PNG alpha=0), including the areas between the two branches. Remove any stray pixels around the edge. This is a cutout for a website header and browser favicon. Do not fill the background with black, white, a checkerboard or any colour; return a real transparent PNG. Do not add text, borders, shadows, glow or any new elements.
```
