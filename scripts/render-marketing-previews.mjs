#!/usr/bin/env node
// Renderiza as 4 compositions Marketing BR em 1:1 (540×540 webm) para web/previews/.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const jobs = [
  ["MktPrecoAncorado", "PrecoAncorado-Autoral.webm"],
  ["MktSeloRegressiva", "SeloDesconto-Regressiva-Autoral.webm"],
  ["MktProvaSocial", "ProvaSocial-Autoral.webm"],
  ["MktCtaBrasil", "CtaBrasil-Autoral.webm"],
];

for (const [id, file] of jobs) {
  const out = join(ROOT, "web", "previews", file);
  console.log("render", id, "→", file, "(1:1 via scale 0.5 de 1080²)");
  const r = spawnSync(
    "npx",
    ["remotion", "render", id, out, "--codec=vp8", "--scale=0.5"],
    { cwd: ROOT, stdio: "inherit" },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const link = spawnSync("node", [join(ROOT, "scripts", "link-previews.mjs")], { cwd: ROOT, stdio: "inherit" });
process.exit(link.status ?? 0);
