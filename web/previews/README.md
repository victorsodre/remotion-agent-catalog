# Como gravar as prévias

O visualizador lê **só esta pasta**. Nome: `<Nome>-<Lib>.webm` (lista em `FALTAM.md`).

Dá para renderizar **neste repo** (o Studio já tem as compositions):

```bash
# uma
npx remotion render PixQr-Autoral web/previews/PixQr-Autoral.webm --codec=vp8 --scale=0.5
node scripts/link-previews.mjs

# lote
npm run previews:render
```

Codec VP8 / WebM, scale 0.5 (540×540). `AnimatedBarChart` aparece duas vezes no índice e gera **um** arquivo. Só fica de fora o Typewriter remocn (ainda é card no Studio).

O fluxo antigo (render no projeto de origem) continua em `origin-templates/`.
