# origin-templates — preview rendering kit

**These files do not run in this repository.** They belong in the **source Remotion project**
(the one containing `src/`, `remotion.config.ts`, and the real components), because that is
where the component source exists to render. `remotion-agent-catalog` contains only
`catalog.json` and the viewer, which reads the optional `preview` field when present.

## Goal

Render a short `.webm` preview for each `catalog.json` component and write its path to the
`preview` field. Copy the files to `web/previews/` in this repository and commit the updated
`catalog.json`; the published viewer then shows the real effect in its paginated catalog.

## Steps in the source project

1. Copy `Preview.tsx` and `preview-registry.ts` to `src/` and populate `PREVIEW_REGISTRY`
   (an `importa`/`nome` → component map). The source already imports those components in its
   catalog pages, so the registry uses the same imports.
2. Register the composition in `Root.tsx` (see `register-preview.tsx`).
3. Copy `render-previews.mjs` to `scripts/` and run it against the catalog repository clone.
   It renders **directly** to `web/previews/` and updates its `catalog.json`:

   ```bash
   ENTRY=src/index.ts \
   CATALOG_DIR=/path/to/remotion-agent-catalog \
   node scripts/render-previews.mjs
   ```
4. In the catalog repository, commit and publish (the script prints this command at the end):

   ```bash
   cd /path/to/remotion-agent-catalog
   git add web/previews catalog.json
   git commit -m "feat: rendered previews"
   git push origin main
   ```

## Constraints from the six failure modes

- **Maps do not render headlessly** (`maplibre-gl`/WebGL2): skip map components. The script already
  ignores `PAGINA_MAPAS` and `importa` values containing `mapa`.
- **`defaultProps` crosses JSON**: `Preview` receives only string `nome` and `importa` values, never JSX.
- **`useVideoConfig()` reports the composition**: `Preview` is a real composition, not a transform-scaled cell, so components receive real preview dimensions.
- **Legitimate name collision** (`Typewriter` in RemotionUI and Remocn): registry keys use unique `importa`; filenames use `nome+lib` to avoid collisions.
