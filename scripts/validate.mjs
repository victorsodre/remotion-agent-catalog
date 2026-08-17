#!/usr/bin/env node
// Valida catalog.json contra o JSON Schema E contra os invariantes semânticos
// que a documentação promete. Sai com código != 0 se algo divergir — é isto que
// roda no CI e trava regressões reais (typo de peça, 5º item na página, conflito
// novo de lib, contagem fora do README).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import {
  loadCatalog,
  getPieces,
  uniqueNames,
  libCounts,
  importLibConflicts,
  nameCollisions,
  danglingTrackRefs,
  EXPECTED,
  KNOWN_NAME_COLLISIONS,
} from "./catalog-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = join(HERE, "..", "schema", "catalog.schema.json");

const errors = [];
const fail = (msg) => errors.push(msg);
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const cat = loadCatalog(process.argv[2]);
const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));

// 1) Schema
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
if (!validate(cat)) {
  for (const e of validate.errors ?? []) fail(`schema ${e.instancePath || "/"} ${e.message}`);
}

const pieces = getPieces(cat);
const names = uniqueNames(pieces);

// 2) Contagem total (== README)
if (names.length !== EXPECTED.totalUniqueNames) {
  fail(`nomes únicos = ${names.length}, esperado ${EXPECTED.totalUniqueNames}`);
}

// 3) Contagem por lib (== tabela do README)
const counts = libCounts(pieces);
if (!eq(counts, EXPECTED.perLib)) {
  fail(`contagem por lib ${JSON.stringify(counts)} != esperado ${JSON.stringify(EXPECTED.perLib)}`);
}

// 4) importa -> lib é função bem definida
const impConf = importLibConflicts(pieces);
for (const c of impConf) fail(`import "${c.importa}" aponta para libs diferentes: ${c.libs.join(", ")}`);

// 5) Nenhuma colisão de nome NOVA além das conhecidas
const collisions = nameCollisions(pieces);
const collisionMap = Object.fromEntries(collisions.map((c) => [c.nome, c.libs]));
const knownNormalized = Object.fromEntries(
  Object.entries(KNOWN_NAME_COLLISIONS).map(([n, libs]) => [n, [...libs].sort()]),
);
if (!eq(collisionMap, knownNormalized)) {
  fail(`colisões de nome ${JSON.stringify(collisionMap)} != conhecidas ${JSON.stringify(knownNormalized)}`);
}

// 6) Referências de trilha de receita resolvem para peças reais
for (const d of danglingTrackRefs(cat)) {
  fail(`receita "${d.receita}": trilha "${d.trilha}" referencia peça inexistente "${d.token}"`);
}

// --- Relatório informativo ---
const crossListed = Object.entries(
  pieces.reduce((acc, p) => {
    const k = `${p.nome}|${p.importa}`;
    (acc[k] ??= []).push(p.origem);
    return acc;
  }, {}),
)
  .filter(([, origens]) => origens.length > 1)
  .map(([k, origens]) => `${k.split("|")[0]} (${origens.join(", ")})`);

console.log("catalog.json");
console.log(`  entradas (paginas+verticais): ${pieces.length}`);
console.log(`  nomes únicos: ${names.length}`);
console.log(`  por lib: ${JSON.stringify(counts)}`);
console.log(`  páginas: ${cat.paginas.length}  verticais: ${cat.verticais.length}  escolhas: ${cat.escolhas.length}  receitas: ${cat.receitas.length}`);
console.log(`  receitas completas (com trilhas): ${cat.receitas.filter((r) => r.trilhas).length}  / stubs: ${cat.receitas.filter((r) => !r.trilhas).length}`);
console.log(`  colisões de nome conhecidas: ${collisions.map((c) => `${c.nome} [${c.libs.join(", ")}]`).join("; ") || "nenhuma"}`);
console.log(`  peças multi-listadas (mesmo import em >1 página): ${crossListed.join("; ") || "nenhuma"}`);

if (errors.length) {
  console.error(`\nFALHOU — ${errors.length} problema(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("\nOK — schema válido e todos os invariantes batem com o README.");
