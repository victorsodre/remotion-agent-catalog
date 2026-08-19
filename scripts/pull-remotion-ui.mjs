#!/usr/bin/env node
/**
 * Reinstala as peças RemotionUI do catalog.json.
 * O CLI pode patchar src/Root.tsx — este script restaura o Root depois.
 */
import { execSync } from "node:child_process";
import { copyFileSync, readFileSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(root, "catalog.json"), "utf8"));
const names = new Set();
for (const pg of catalog.paginas ?? []) {
  for (const it of pg.itens ?? []) {
    if (it.lib === "RemotionUI") names.add(String(it.importa).split("/").pop());
  }
}
for (const v of catalog.verticais ?? []) {
  if (v.lib === "RemotionUI") names.add(String(v.importa).split("/").pop());
}
names.delete("clock-wipe"); // @remotion/transitions, não o registry

const list = [...names].sort();
const rootFile = join(root, "src/Root.tsx");
const bak = join(root, "src/Root.tsx.libs-bak");
copyFileSync(rootFile, bak);
try {
  for (const name of list) {
    execSync(`npx remotion-ui@latest add ${name} -y`, { cwd: root, stdio: "inherit" });
  }
} finally {
  copyFileSync(bak, rootFile);
  try {
    unlinkSync(bak);
  } catch {}
}
