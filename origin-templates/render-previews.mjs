// VAI NA ORIGEM (scripts/render-previews.mjs) — roda no projeto Remotion de
// origem (precisa dos componentes reais). Renderiza um .webm curto por peça e
// salva DIRETO no repo do catálogo: os arquivos em web/previews/ e o campo
// `preview` gravado no catalog.json de lá. Sem passo de cópia manual.
//
// Pré-requisito (uma vez): ter colado Preview.tsx + preview-registry.ts
// (preenchido) e registrado a composition "Preview" no seu Root.tsx.
//
// Uso:
//   ENTRY=src/index.ts \
//   CATALOG_DIR=/caminho/para/remotion-agent-catalog \
//   node scripts/render-previews.mjs
//
// CATALOG_DIR default: ../remotion-agent-catalog (ajuste ao seu layout).

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const ENTRY = path.resolve(process.env.ENTRY ?? "src/index.ts");
const CATALOG_DIR = path.resolve(process.env.CATALOG_DIR ?? "../remotion-agent-catalog");
const CATALOG = path.join(CATALOG_DIR, "catalog.json");
const OUT_DIR = path.join(CATALOG_DIR, "web", "previews"); // exatamente onde o site serve
const FPS = 30;

const slug = (s) => String(s).replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "");
const fileId = (p) => slug(`${p.nome}-${p.lib}`);          // único mesmo em colisão (Typewriter)
const isMapa = (p) => /mapa|maplibre|map-/i.test(`${p.nome} ${p.importa}`); // mapas não renderizam headless

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
  const portrait = p._sec === "vertical";                  // verticais = 9:16
  const width = portrait ? 540 : 960;
  const height = portrait ? 960 : 540;
  const durationInFrames = p.ciclo ?? p.duracao ?? 90;
  const outFile = path.join(OUT_DIR, `${fileId(p)}.webm`);
  const inputProps = { nome: p.nome, importa: p.importa };

  const base = await selectComposition({ serveUrl, id: "Preview", inputProps });
  await renderMedia({
    serveUrl,
    codec: "vp8",                                          // webm leve p/ loop no browser
    outputLocation: outFile,
    inputProps,
    composition: { ...base, durationInFrames, fps: FPS, width, height },
  });
  p.preview = `previews/${fileId(p)}.webm`;                 // relativo à raiz do site
  done++; console.log(`ok (${done}/${pieces.length})`, p.nome, "->", outFile);
}

writeFileSync(CATALOG, JSON.stringify(cat, null, 2));
console.log(`\nfeito: ${done} renderizadas, ${skipped} puladas.`);
console.log(`arquivos em ${OUT_DIR}`);
console.log(`catalog.json atualizado em ${CATALOG}`);
console.log(`\nagora, no repo do catálogo:\n  cd ${CATALOG_DIR}\n  git add web/previews catalog.json && git commit -m "feat: previas renderizadas" && git push origin main`);
