#!/usr/bin/env node
// CLI de consulta do catálogo. O valor está na busca por intenção (campo `quando`):
// o agente descreve o que quer e recebe nome + caminho de import + procedência.
//
//   remotion-catalog find "transição"      peças cuja intenção casa o termo
//   remotion-catalog show Typewriter        detalhe da(s) peça(s) com esse nome
//   remotion-catalog stats                  contagens (total, por lib, seções)
//   remotion-catalog libs [RemotionUI]      lista peças, opcionalmente por lib
//   remotion-catalog recipes [ReceitaAbertura]  receitas (lista ou detalhe)
//
// Qualquer comando aceita --json para saída legível por máquina.

import {
  loadCatalog,
  getPieces,
  uniqueNames,
  libCounts,
  findByIntent,
  findByName,
  LIBS,
} from "../scripts/catalog-lib.mjs";

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const args = argv.filter((a) => a !== "--json");
const [cmd, ...rest] = args;

const cat = loadCatalog();
const pieces = getPieces(cat);

function out(obj, text) {
  if (asJson) console.log(JSON.stringify(obj, null, 2));
  else text();
}

function printPiece(p) {
  const extra = p.ciclo ? `ciclo ${p.ciclo}` : p.duracao ? `dur ${p.duracao}` : "";
  console.log(`  ${p.nome}  [${p.lib}]${extra ? "  " + extra : ""}`);
  console.log(`      import ${p.importa}`);
  console.log(`      quando ${p.quando}`);
}

function help() {
  console.log(`remotion-catalog — consulta do catálogo de peças Remotion

  find <termo>              peças cuja intenção (quando) casa o termo
  show <Nome>               detalhe da(s) peça(s) com esse nome
  stats                     contagens do catálogo
  libs [${LIBS.join("|")}]  lista peças (opcionalmente filtrando por lib)
  recipes [id]              receitas (lista ou detalhe de uma)

  --json                    saída em JSON`);
}

switch (cmd) {
  case "find": {
    const termo = rest.join(" ");
    if (!termo) { console.error("uso: remotion-catalog find <termo>"); process.exit(2); }
    const hits = findByIntent(pieces, termo);
    out(hits.map(({ nome, lib, importa, quando }) => ({ nome, lib, importa, quando })), () => {
      if (!hits.length) { console.log(`nenhuma peça casa "${termo}"`); return; }
      console.log(`${hits.length} peça(s) para "${termo}":`);
      hits.forEach(printPiece);
    });
    break;
  }
  case "show": {
    const nome = rest.join(" ");
    if (!nome) { console.error("uso: remotion-catalog show <Nome>"); process.exit(2); }
    const hits = findByName(pieces, nome);
    out(hits, () => {
      if (!hits.length) { console.log(`peça "${nome}" não encontrada`); process.exitCode = 1; return; }
      console.log(`${hits.length} entrada(s) para "${nome}":`);
      hits.forEach((p) => { printPiece(p); console.log(`      origem ${p.origem}`); });
    });
    break;
  }
  case "stats": {
    const counts = libCounts(pieces);
    const stats = {
      entradas: pieces.length,
      nomesUnicos: uniqueNames(pieces).length,
      porLib: counts,
      paginas: cat.paginas.length,
      verticais: cat.verticais.length,
      escolhas: cat.escolhas.length,
      receitas: cat.receitas.length,
    };
    out(stats, () => {
      console.log(`entradas: ${stats.entradas}   nomes únicos: ${stats.nomesUnicos}`);
      console.log(`por lib: ${LIBS.map((l) => `${l} ${counts[l]}`).join("  ")}`);
      console.log(`páginas ${stats.paginas}  verticais ${stats.verticais}  escolhas ${stats.escolhas}  receitas ${stats.receitas}`);
    });
    break;
  }
  case "libs": {
    const lib = rest[0];
    if (lib && !LIBS.includes(lib)) { console.error(`lib inválida. use: ${LIBS.join(", ")}`); process.exit(2); }
    const list = lib ? pieces.filter((p) => p.lib === lib) : pieces;
    out(list.map(({ nome, lib, importa, quando }) => ({ nome, lib, importa, quando })), () => {
      console.log(`${list.length} peça(s)${lib ? ` de ${lib}` : ""}:`);
      list.forEach(printPiece);
    });
    break;
  }
  case "recipes": {
    const id = rest[0];
    if (id) {
      const r = cat.receitas.find((x) => x.id === id);
      if (!r) { console.error(`receita "${id}" não encontrada`); process.exit(1); }
      out(r, () => console.log(JSON.stringify(r, null, 2)));
    } else {
      out(cat.receitas.map(({ id, titulo, formato, duracao, trilhas }) => ({ id, titulo, formato, duracao, completa: !!trilhas })), () => {
        cat.receitas.forEach((r) => console.log(`  ${r.id}  ${r.formato}  ${r.duracao}f  ${r.trilhas ? "(completa)" : "(stub)"}  — ${r.titulo}`));
      });
    }
    break;
  }
  case "help": case "--help": case "-h": case undefined:
    help();
    break;
  default:
    console.error(`comando desconhecido: ${cmd}\n`);
    help();
    process.exit(2);
}
