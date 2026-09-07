# AGENTS.md

Copy this guide into a Remotion project before an agent writes a composition. In this repository, start with [README.md](./README.md) and [docs/ARQUITETURA.md](./docs/ARQUITETURA.md). The `npm run catalog` command mentioned below belongs to the source generator and is intentionally absent here.

`catalog.json` is generated. Never edit it by hand in this repository.

## Six failure modes

These were found by breaking real compositions. Most fail silently.

### 1. `useVideoConfig()` reports the composition, not its container

Components that calculate font size, safe area, or percentage positions read the dimensions of their `<Composition>`, not the element that contains them. `transform: scale()` shrinks the frame but not its layout calculations.

- To show a 1920×1080 scene in a cell, use the `cena: true` `Item` flag so it renders at full size before it is scaled.
- For vertical work, create a real 1080×1920 `<Composition>`.
- `cena: true` is also required for canvas-percentage components such as `SimulatedCursor`.

### 2. `Sequence` renders an `AbsoluteFill`

It leaves normal flow. Several `Sequence` elements inside a `space-between` flex layout collapse into the upper-left corner. Stack them with explicit absolute `top` and `left` positions, as in `src/playground/pecas.tsx`.

### 3. `defaultProps` crosses a JSON boundary

React elements arrive as `{key, ref, props}` and can trigger React error #31. Do not pass JSX through `defaultProps`; build stable page components in the module instead:

```tsx
const COMPONENTES = Object.fromEntries(
  PAGINAS.map((p) => [p.id, () => <Pagina {...p} />]),
);
```

### 4. Effect order and type matter

- Generators (`checkerboard`, `rings`, `lightLeak`, `zigzag`) draw new pixels and discard what was below.
- Filters (`thermalVision`, `halftone`, `pixelate`, `duotone`, `zoomBlur`) transform existing pixels.

A filter with no input produces nothing; a generator at the end erases previous work. Configure effects explicitly—many defaults, including `duotone({})`, are not useful.

### 5. `TransitionSeries` is shorter than the sum of its sequences

Its duration is the sum of sequences minus the overlaps. Two 40-frame sequences with a 20-frame transition last 60 frames, not 80. A longer `<Loop>` leaves black frames. Use `cicloTransicao()` from `pages-extra.tsx`; favor short blocks and longer transitions.

### 6. Some media scenes accept only images

`MediaFrame` and `SplitScreen` choose `<Img>` or `<Video>` through `isVideoSource(src)`. `ZoomPanFrame`, `DeviceMockupZoom`, and `CalloutSpotlight` render only `<Img>`; passing video gives an empty frame without an error. Extract a still instead:

```bash
ffmpeg -ss 3.2 -i public/video.mp4 -frames:v 1 -q:v 2 public/video.jpg
```

Square media in a 16:9 scene produces letterboxing; use `fit="cover"`.

## Three 3D failure modes

These were isolated while porting the authored three.js `LampadaBrowserFlow` scene. Their separate numbering is intentional: the six failure modes above are referenced by number in code comments. These failures can look correct in Studio and render black in the MP4; they were isolated by bisection with `npx remotion still` at each step.

### 3D-1. `UnrealBloomPass` must be last

Outside the final position, `needsSwap = false` makes it composite bloom back into its own `readBuffer`, whose texture the high-pass just sampled. That creates a framebuffer-to-texture feedback loop. Headless Chromium can discard the draw and every later pass reads black, with no shader, GL, context, or console error. The behavior reproduces with `--gl=angle` and `--gl=swangle`. Put bloom last; do not use it if later passes are required.

### 3D-2. Final bloom can apply tone mapping and sRGB twice

Drawing with `setRenderTarget(null)` makes three apply `toneMapping` and `outputColorSpace`. With a preceding `OutputPass`, conversion happens twice and produces a washed-out image. In this project the wood floor changed from `(123,101,82)` to `(198,187,176)`. Remove `OutputPass` and let the renderer convert once during the final draw; bloom then operates in the linear HDR space for which its original thresholds were calibrated.

### 3D-3. `SMAAPass` r168+ is asynchronous

Its `new SMAAPass(width, height)` constructor dimensions are ignored, and lookup textures load through `new Image()`. A browser animation loop hides this; a one-frame render does not. Use MSAA on the composer target instead: `new WebGLRenderTarget(w, h, { samples: 4 })`. Three.js documents this kind of pass after `OutputPass`; before it, the pass operates in linear HDR rather than sRGB.

For all 3D scenes, each frame must be a pure function of `useCurrentFrame()`. React Three Fiber `useFrame()` is clock-driven and non-deterministic in rendered output. Use `useDelayRender()` for async GLB, textures, and shaders; its default 30-second timeout does not cover a heavy scene. Render the same frame twice in separate processes and compare hashes.

## Environment rules

- Keep `typescript` on `5.x`: TypeScript 7 removed `ts.sys` from its JavaScript API and the Remotion bundler depends on it. A typical symptom is `Cannot read properties of undefined (reading 'readFile')`.
- Configure the `@/` alias in both `tsconfig.json` (`paths`) and `remotion.config.ts` (`overrideWebpackConfig`). Configuring only TypeScript makes type checking pass while rendering fails.
- Restart Studio after changing either configuration file. Studio reads them only at boot; hot reload does not apply them and the symptom is a blank page.
- `maplibre-gl` requires WebGL2 and does not render headlessly; `useDelayRender()` cannot solve that. `PAGINA_MAPAS` remains deliberately unregistered.

## RemotionUI CLI

- `remotion-ui add` for a composition edits `Root.tsx`; inspect it afterwards.
- `remotion-ui init` creates a nested project when it cannot find config; write `remotion-ui.json` yourself.
- Updating the library can overwrite copied files. Version 0.7.0 rewrote `transition-timing.ts` and changed `TerminalSimulator`; reinstall affected components deliberately.

## Writing a component here

1. Consult `catalog.json` for intent (`quando`) and the import path (`importa`).
2. Import colors and typography from `src/shared/theme.ts` (`PALETTE`, `MONO`, `RADIUS`); do not scatter hex values, which breaks a brand change in `brand.ts`.
3. Pass explicit `fontSize` when supported. Otherwise a component derives it from `useVideoConfig()` and does not scale.
4. Animate one thing at a time; see `src/recipes/recipes.tsx`.
5. Verify by rendering, not by reading: `npx remotion still <Id> out/x.png --frame=N`, then inspect the image. Many defects here surfaced only this way.
6. Run the source generator's `npm run catalog` after adding a page component.

## Attribution and catalog conventions

- Keep identifiers stable. The public interface is English-first with a pt-BR option; generated catalog values remain source data.
- `AUTORAL` applies only to code written here. Never mark library code as authored, and do not infer provenance from memory: `catalog.json.lib` is authoritative.
- The catalog grid is four items per page. Add a page rather than a fifth item.
- Brazil vertical components (`src/remotion/brasil/`) receive `escala`, never `useVideoConfig()`-derived `fontSize`.

## Relationship to official Remotion Agent Skills

The official skills published on 2026-08-14 (commit `9f0faa5`) explain framework use. They complement this repository: Agent Skills explain **how** to write Remotion; `catalog.json` explains **what** is available; this guide explains **where it fails**. The official skills cover `TransitionSeries`; they partially cover composition dimensions, `Sequence`, and JSON-serializable props. Effect ordering and media-scene limitations remain project-specific.

## Repository environment

Comments explain code, never conversations. Do not put home paths or personal email addresses in source. The source generator is not present here. Treat `catalog.json` as read-only except for the optional `preview` field maintained by `scripts/link-previews.mjs`.

- `npm install` installs Remotion 4.0.x, MCP, and AJV.
- `npm run validate` and `npm test` verify the catalog and tooling.
- `npm run studio` serves 102 1080×1080 square compositions at `http://localhost:3000`, organized by catalog page. `TextoEntrada` lasts 180 frames. `SlotRoll` needs an explicit `color` because its light default disappears on `THEME.ink`; the remocn Typewriter remains a card.
  `StaggeredMotion` opens with a negative `delay` so frame 0 is not empty. Brazil components use `ENTER = -16` in `useSpring` for the same reason, and Marketing BR loops begin with `Sequence from={-36}`. If the Studio canvas looks white at `00:00.00`, press Space: the theme is light paper, not an empty render. `localhost:3000` is Studio; the Pages site and `npm run web` are the static viewer.
  `remotion-bits@0.2.0` imports `culori` into the bundle, and this repository declares it. `npx remotion-ui add` edits `Root.tsx`; inspect Root after `npm run libs`.
- `npm run web` serves the static viewer at `http://localhost:8080/web/`; use HTTP rather than `file://`. Its library filter is one at a time (All, RemotionUI, Authored, Bits, or Remocn), without a “real video” chip. Render previews with `npm run previews:render` (VP8 540×540 in `web/previews/`), or one piece with `npx remotion render PixQr-Autoral web/previews/PixQr-Autoral.webm --codec=vp8 --scale=0.5` followed by `node scripts/link-previews.mjs`. Skip maps, the remocn Typewriter, and vertical compositions.
- `npx remotion-catalog find "<intent>"` and `npm run mcp` expose the catalog to tools.

There is no lint command. Run `npm run validate`, `npm test`, and `npm run typecheck` after TypeScript changes. Intentional data nuances include the two distinct Typewriter entries, the multi-listed `AnimatedBarChart`, composed tracks such as `UI + SimulatedCursor`, and four reel recipe stubs without `trilhas`.
