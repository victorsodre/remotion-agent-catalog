// VAI NA ORIGEM (scripts/render-previews.mjs) — não roda no repo do catálogo
// (precisa dos componentes reais). Renderiza um .webm curto por peça e grava o
// caminho no campo `preview` do catalog.json.
//
//   node scripts/render-previews.mjs
//
// Depois: copie public/previews/*.webm para web/previews/ no repo do catálogo
// e commite o catalog.json atualizado — o site publicado mostra o efeito real.

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const ENTRY = path.resolve("src/index.ts"); // ajuste ao entryPoint da sua origem
const CATALOG = path.resolve("catalog.json");
const OUT_DIR = path.resolve("public/previews");
const FPS = 30;

const slug = (s) => String(s).replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "");
// Nome de arquivo único mesmo em colisão de nome (Typewriter): usa nome + lib.
const fileId = (p) => slug(`${p.nome}-${p.lib}`);
// Mapas não renderizam headless (WebGL2) — pule.
const isMapa = (p) => /mapa|maplibre|map-/i.test(`${p.nome} ${p.importa}`);

const cat = JSON.parse(readFileSync(CATALOG, "utf8"));
const pieces = [
  ...cat.paginas.flatMap((pg) => pg.itens.map((it) => ({ ...it, _sec: "pagina" }))),
  ...cat.verticais.map((v) => ({ ...v, _sec: "vertical" })),
];

mkdirSync(OUT_DIR, { recursive: true });
console.log(`bundling ${ENTRY} …`);
const serveUrl = await bundle({ entryPoint: ENTRY });

let done = 0, skipped = 0;
for (const p of pieces) {
  if (isMapa(p)) { console.log("skip (mapa):", p.nome); skipped++; continue; }
  const portrait = p._sec === "vertical";           // verticais = 9:16
  const width = portrait ? 540 : 960;
  const height = portrait ? 960 : 540;
  const durationInFrames = p.ciclo ?? p.duracao ?? 90;
  const outFile = path.join(OUT_DIR, `${fileId(p)}.webm`);
  const inputProps = { nome: p.nome, importa: p.importa };

  const base = await selectComposition({ serveUrl, id: "Preview", inputProps });
  await renderMedia({
    serveUrl,
    codec: "vp8",                                    // webm leve para loop no browser
    outputLocation: outFile,
    inputProps,
    composition: { ...base, durationInFrames, fps: FPS, width, height },
  });
  p.preview = `previews/${fileId(p)}.webm`;           // relativo à raiz do site
  done++; console.log(`ok (${done}/${pieces.length})`, p.nome, "->", path.relative(process.cwd(), outFile));
}

writeFileSync(CATALOG, JSON.stringify(cat, null, 2));
console.log(`\nfeito: ${done} renderizadas, ${skipped} puladas. catalog.json atualizado com 'preview'.`);
