import { test } from "node:test";
import assert from "node:assert/strict";
import {
  loadCatalog,
  getPieces,
  uniqueNames,
  libCounts,
  importLibConflicts,
  nameCollisions,
  danglingTrackRefs,
  findByIntent,
  findByName,
  EXPECTED,
} from "../scripts/catalog-lib.mjs";

const cat = loadCatalog();
const pieces = getPieces(cat);

test("catálogo real: contagens batem com o README", () => {
  assert.equal(uniqueNames(pieces).length, EXPECTED.totalUniqueNames);
  assert.deepEqual(libCounts(pieces), EXPECTED.perLib);
});

test("catálogo real: importa -> lib é função bem definida", () => {
  assert.deepEqual(importLibConflicts(pieces), []);
});

test("catálogo real: única colisão de nome é Typewriter", () => {
  assert.deepEqual(nameCollisions(pieces), [{ nome: "Typewriter", libs: ["Remocn", "RemotionUI"] }]);
});

test("catálogo real: nenhuma referência de trilha pendurada", () => {
  assert.deepEqual(danglingTrackRefs(cat), []);
});

test("find_by_intent casa no campo quando (case-insensitive)", () => {
  const hits = findByIntent(pieces, "GANCHO");
  assert.ok(hits.length >= 1);
  assert.ok(hits.every((p) => p.quando.toLowerCase().includes("gancho")));
});

test("find_by_intent é acento-insensitive (transicao == transição)", () => {
  const comAcento = findByIntent(pieces, "transição").map((p) => p.nome).sort();
  const semAcento = findByIntent(pieces, "transicao").map((p) => p.nome).sort();
  assert.ok(semAcento.length >= 1);
  assert.deepEqual(semAcento, comAcento);
});

test("findByName acha as duas entradas de Typewriter", () => {
  const hits = findByName(pieces, "typewriter");
  assert.equal(hits.length, 2);
  assert.deepEqual(hits.map((p) => p.lib).sort(), ["Remocn", "RemotionUI"]);
});

// --- Detectores pegam problemas em catálogos sintéticos quebrados ---

test("importLibConflicts detecta import com dois libs", () => {
  const broken = getPieces({
    paginas: [{ id: "x", itens: [
      { nome: "A", lib: "RemotionUI", importa: "@/x", quando: "q", ciclo: 1 },
      { nome: "B", lib: "Autoral", importa: "@/x", quando: "q", ciclo: 1 },
    ] }],
    verticais: [],
  });
  assert.equal(importLibConflicts(broken).length, 1);
});

test("nameCollisions detecta colisão nova", () => {
  const broken = getPieces({
    paginas: [{ id: "x", itens: [
      { nome: "Dup", lib: "RemotionUI", importa: "@/a", quando: "q", ciclo: 1 },
      { nome: "Dup", lib: "Bits", importa: "@/b", quando: "q", ciclo: 1 },
    ] }],
    verticais: [],
  });
  assert.deepEqual(nameCollisions(broken), [{ nome: "Dup", libs: ["Bits", "RemotionUI"] }]);
});

test("danglingTrackRefs pega peça inexistente e ignora token genérico UI", () => {
  const fake = {
    paginas: [{ id: "p", itens: [{ nome: "SimulatedCursor", lib: "RemotionUI", importa: "@/c", quando: "q", ciclo: 1 }] }],
    verticais: [],
    receitas: [{ id: "R", trilhas: [
      { nome: "UI + SimulatedCursor", from: 0, dur: 10 },
      { nome: "NaoExiste", from: 0, dur: 10 },
    ] }],
  };
  const bad = danglingTrackRefs(fake);
  assert.equal(bad.length, 1);
  assert.equal(bad[0].token, "NaoExiste");
});
