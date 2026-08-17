import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { writeFileSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const VALIDATE = join(HERE, "..", "scripts", "validate.mjs");
const CATALOG = join(HERE, "..", "catalog.json");

function runValidate(catObj) {
  const dir = mkdtempSync(join(tmpdir(), "cat-"));
  const file = join(dir, "catalog.json");
  writeFileSync(file, JSON.stringify(catObj));
  return spawnSync(process.execPath, [VALIDATE, file], { encoding: "utf8" });
}

test("validate passa no catálogo real", () => {
  const r = spawnSync(process.execPath, [VALIDATE], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
});

test("validate falha quando uma página tem 5 itens", () => {
  const cat = JSON.parse(readFileSync(CATALOG, "utf8"));
  const extra = { ...cat.paginas[0].itens[0], nome: "QuintoItem" };
  cat.paginas[0].itens = [...cat.paginas[0].itens.slice(0, 4), extra];
  const r = runValidate(cat);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /maxItems|4 item|schema/i);
});

test("validate falha com lib desconhecida", () => {
  const cat = JSON.parse(readFileSync(CATALOG, "utf8"));
  cat.paginas[0].itens[0].lib = "MinhaLibFake";
  const r = runValidate(cat);
  assert.equal(r.status, 1);
});

test("validate falha quando a contagem diverge do README", () => {
  const cat = JSON.parse(readFileSync(CATALOG, "utf8"));
  cat.paginas[0].itens.pop(); // remove uma peça -> total != 102
  const r = runValidate(cat);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /nomes únicos|contagem/i);
});
