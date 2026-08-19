#!/usr/bin/env node
// Renderiza um .webm 1:1 (540×540, VP8) por peça do catálogo, a partir das
// compositions do Studio deste repo. Liga o campo `preview` no catalog.json.
//
//   npm run previews:render
//   node scripts/render-catalog-previews.mjs --only=PixQr,BlurFocusIn
//   node scripts/render-catalog-previews.mjs --force          # refaz as que já existem
//   node scripts/render-catalog-previews.mjs --dry-run
//
// Uma peça só (sem este script):
//   npx remotion render PixQr-Autoral web/previews/PixQr-Autoral.webm --codec=vp8 --scale=0.5
//   node scripts/link-previews.mjs

import { bundle } from "@remotion/bundler";
import { ensureBrowser, getCompositions, renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { loadCatalog, previewFileId, slug } from "./catalog-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "web", "previews");
const SCALE = 0.5;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg
  ? onlyArg
      .slice("--only=".length)
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  : null;


function uniqueId(base, used) {
  let id = base.replace(/[^A-Za-z0-9-]/g, "-");
  if (!/^[A-Za-z]/.test(id)) id = `P-${id}`;
  let n = 2;
  let out = id;
  while (used.has(out)) out = `${id}-${n++}`;
  used.add(out);
  return out;
}

function isMapa(p) {
  return /mapa|maplibre|map-/i.test(`${p.nome} ${p.importa ?? ""}`);
}

function skipReason(p) {
  if (isMapa(p)) return "mapa (WebGL, não renderiza headless)";
  if (p.nome === "Typewriter" && p.lib === "Remocn") return "Typewriter remocn ainda é card";
  return null;
}

function matchesOnly(p) {
  if (!only) return true;
  const hay = [p.compositionId, p.fileId, p.nome, p.lib].map((s) => String(s).toLowerCase());
  return only.some((q) => hay.some((h) => h.includes(q)));
}

const cat = loadCatalog();
const used = new Set();
const jobs = [];
for (const pg of cat.paginas ?? []) {
  for (const it of pg.itens ?? []) {
    const compositionId = uniqueId(slug(`${it.nome}-${it.lib}`), used);
    jobs.push({
      ...it,
      pagina: pg.titulo ?? pg.id,
      compositionId,
      fileId: previewFileId(it),
      _vertical: false,
    });
  }
}
for (const v of cat.verticais ?? []) {
  const compositionId = uniqueId(slug(`${v.nome}-${v.lib}`), used);
  jobs.push({
    ...v,
    pagina: "Verticais",
    compositionId,
      fileId: previewFileId(v),
    _vertical: true,
  });
}

// Mesmo arquivo (AnimatedBarChart listada duas vezes): um render só.
const seenFile = new Set();
const planned = [];
for (const p of jobs) {
  if (!matchesOnly(p)) continue;
  const why = skipReason(p);
  if (why) {
    console.log("skip", p.nome, `[${p.lib}]`, "—", why);
    continue;
  }
  if (seenFile.has(p.fileId)) {
    console.log("skip", p.compositionId, "— mesmo arquivo que", p.fileId + ".webm");
    continue;
  }
  seenFile.add(p.fileId);
  planned.push(p);
}

mkdirSync(OUT_DIR, { recursive: true });

const todo = [];
let skippedExist = 0;
for (const p of planned) {
  const outFile = join(OUT_DIR, `${p.fileId}.webm`);
  if (!force && existsSync(outFile)) {
    skippedExist++;
    continue;
  }
  todo.push({ ...p, outFile });
}

console.log(
  `${planned.length} peças · ${skippedExist} já na pasta · ${todo.length} para renderizar` +
    (dryRun ? " (dry-run)" : ""),
);

if (dryRun) {
  for (const p of todo) console.log("  ", p.compositionId, "→", `${p.fileId}.webm`);
  process.exit(0);
}

if (todo.length === 0) {
  console.log("nada a renderizar. `--force` refaz as existentes.");
} else {
  await ensureBrowser();
  console.log("bundling src/index.ts …");
  const serveUrl = await bundle({
    entryPoint: join(ROOT, "src", "index.ts"),
    enableCaching: true,
    webpackOverride: (current) => ({
      ...current,
      resolve: {
        ...current.resolve,
        alias: {
          ...current.resolve?.alias,
          "@": join(ROOT, "src"),
        },
      },
    }),
  });
  const comps = await getCompositions(serveUrl);
  const known = new Set(comps.map((c) => c.id));

  let done = 0;
  let failed = 0;
  for (const p of todo) {
    if (!known.has(p.compositionId)) {
      console.error("fail", p.compositionId, "— composition não registrada no Studio");
      failed++;
      continue;
    }
    process.stdout.write(`render ${p.compositionId} → ${p.fileId}.webm … `);
    try {
      const composition = await selectComposition({ serveUrl, id: p.compositionId });
      await renderMedia({
        serveUrl,
        composition,
        codec: "vp8",
        scale: SCALE,
        outputLocation: p.outFile,
        muted: true,
        logLevel: "error",
        timeoutInMilliseconds: 120_000,
      });
      done++;
      console.log("ok", `(${done}/${todo.length})`);
    } catch (err) {
      failed++;
      console.log("FAIL");
      console.error(err instanceof Error ? err.message : err);
    }
  }
  console.log(`\nrender: ${done} ok, ${failed} falhou, ${skippedExist} já existiam.`);
  if (failed) process.exitCode = 1;
}

const link = spawnSync("node", [join(ROOT, "scripts", "link-previews.mjs")], {
  cwd: ROOT,
  stdio: "inherit",
});
if ((link.status ?? 1) !== 0) process.exit(link.status ?? 1);
