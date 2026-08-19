#!/usr/bin/env node
// Liga arquivos em web/previews/ ao catalog.json (campo `preview`).
//
//   node scripts/link-previews.mjs           # liga o que já está na pasta
//   node scripts/link-previews.mjs --list    # só lista o que falta
//
// Nome esperado: <nome>-<lib>.webm  (ex.: PixQr-Autoral.webm)
// Também aceita .mp4 e .gif. Se o nome da peça for único, PixQr.webm também serve.

import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCatalog, getPieces, CATALOG_PATH, previewFileId, slug } from "./catalog-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PREVIEWS = join(HERE, "..", "web", "previews");
const FALTAM = join(PREVIEWS, "FALTAM.md");
const listOnly = process.argv.includes("--list");

const cat = loadCatalog();
const pieces = getPieces(cat);
const files = readdirSync(PREVIEWS).filter((f) => /\.(webm|mp4|gif|mov)$/i.test(f));
const byStem = new Map(files.map((f) => [f.replace(/\.[^.]+$/, ""), f]));

const nomeCount = pieces.reduce((m, p) => { m[p.nome] = (m[p.nome] ?? 0) + 1; return m; }, {});
let linked = 0, already = 0, missing = 0;

function findFile(p) {
  const exact = byStem.get(previewFileId(p));
  if (exact) return exact;
  if (nomeCount[p.nome] === 1) {
    const short = byStem.get(slug(p.nome));
    if (short) return short;
  }
  return null;
}

const missingRows = [];
for (const p of pieces) {
  const file = findFile(p);
  if (file) {
    const path = `previews/${file}`;
    if (p.preview === path) { already++; continue; }
    p.preview = path;
    linked++;
  } else {
    missing++;
    missingRows.push(p);
  }
}

// Espelha de volta no catalog.json (paginas + verticais) pelo (nome, lib, importa)
const byKey = new Map(pieces.map((p) => [`${p.nome}|${p.lib}|${p.importa}`, p.preview]));
for (const pg of cat.paginas) for (const it of pg.itens) {
  const k = `${it.nome}|${it.lib}|${it.importa}`;
  if (byKey.get(k)) it.preview = byKey.get(k);
}
for (const v of cat.verticais) {
  const k = `${v.nome}|${v.lib}|${v.importa}`;
  if (byKey.get(k)) v.preview = byKey.get(k);
}

if (!listOnly && linked > 0) writeFileSync(CATALOG_PATH, JSON.stringify(cat, null, 2) + "\n");

const paginaDe = (p) => (p.origem?.startsWith("pagina:") ? p.origem.slice("pagina:".length) : "Verticais");
const faltamMd = [
  "# O que falta gravar",
  "",
  "Gerado por `node scripts/link-previews.mjs`. Salve em `web/previews/` com o nome da coluna **arquivo**.",
  `Já feitos: ${files.length}. Faltam os abaixo.`,
  "",
  "| página | peça | lib | arquivo |",
  "|---|---|---|---|",
  ...missingRows.map((p) => `| ${paginaDe(p)} | ${p.nome} | ${p.lib} | \`${previewFileId(p)}.webm\` |`),
  "",
];
if (!listOnly) writeFileSync(FALTAM, faltamMd.join("\n"));

console.log(`previews na pasta: ${files.length}`);
console.log(`já ligadas:        ${already}`);
console.log(`ligadas agora:     ${linked}`);
console.log(`ainda faltam:      ${missing}`);
if (missingRows.length) {
  console.log("\npróximas 12 a gravar (nome do arquivo):");
  for (const p of missingRows.slice(0, 12)) {
    console.log(`  ${previewFileId(p)}.webm    ← ${p.nome} [${p.lib}]`);
  }
  if (missingRows.length > 12) console.log(`  … e mais ${missingRows.length - 12}`);
}
if (!listOnly && linked > 0) console.log("\ncatalog.json atualizado. commit: git add web/previews catalog.json && git commit -m \"feat: mais previas\"");
