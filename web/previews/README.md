# Rendering previews

The viewer reads **only this directory**. Files are named `<Name>-<Library>.webm` (see `FALTAM.md`).

You can render them **in this repository** because Studio already has the compositions:

```bash
# one preview
npx remotion render PixQr-Autoral web/previews/PixQr-Autoral.webm --codec=vp8 --scale=0.5
node scripts/link-previews.mjs

# batch
npm run previews:render
```

Use VP8/WebM at scale 0.5 (540×540). `AnimatedBarChart` appears twice in the index and produces **one** file. Only the remocn Typewriter is excluded because it remains a Studio card.

The original source-project workflow remains in `origin-templates/`.
