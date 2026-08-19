// Funções puras compartilhadas por validate.mjs, o CLI e o servidor MCP.
// Não têm efeito colateral e não dependem de nada além do próprio catalog.json.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
export const CATALOG_PATH = join(HERE, "..", "catalog.json");

// Fonte da verdade das bibliotecas aceitas (espelha o README).
export const LIBS = ["RemotionUI", "Autoral", "Bits", "Remocn"];

// Números publicados no README — o validador falha se o catálogo divergir.
export const EXPECTED = {
  totalUniqueNames: 102,
  maxItensPorPagina: 4,
  perLib: { RemotionUI: 68, Autoral: 20, Bits: 10, Remocn: 4 },
};

// Colisões de nome conhecidas e legítimas: peças distintas de libs diferentes
// que por acaso compartilham nome. Uma colisão NOVA (fora desta lista) é erro.
export const KNOWN_NAME_COLLISIONS = {
  Typewriter: ["Remocn", "RemotionUI"],
};

// Tokens genéricos que aparecem em nomes de trilha compostos ("UI + SimulatedCursor")
// e não são — nem precisam ser — peças catalogadas.
export const NON_PIECE_TRACK_TOKENS = new Set(["UI"]);

export function loadCatalog(path = CATALOG_PATH) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Nome de arquivo / id de composition: `PixQr-Autoral`. */
export function slug(s) {
  return (
    String(s)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w.-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "peca"
  );
}

export function previewFileId(p) {
  return slug(`${p.nome}-${p.lib}`);
}

// Todas as peças (paginas[].itens[] + verticais[]), anotadas com a origem.
export function getPieces(cat) {
  const pieces = [];
  for (const pagina of cat.paginas ?? []) {
    for (const item of pagina.itens ?? []) {
      pieces.push({ ...item, origem: `pagina:${pagina.id}` });
    }
  }
  for (const v of cat.verticais ?? []) {
    pieces.push({ ...v, origem: "vertical" });
  }
  return pieces;
}

export function uniqueNames(pieces) {
  return [...new Set(pieces.map((p) => p.nome))];
}

// Regra de contagem que reproduz a tabela do README: agrupa por nome; o lib de
// um nome é o não-RemotionUI quando há colisão (ex.: Typewriter conta como Remocn).
export function libByName(pieces) {
  const map = new Map();
  for (const p of pieces) {
    const cur = map.get(p.nome);
    if (!cur || (cur === "RemotionUI" && p.lib !== "RemotionUI")) map.set(p.nome, p.lib);
  }
  return map;
}

export function libCounts(pieces) {
  const counts = Object.fromEntries(LIBS.map((l) => [l, 0]));
  for (const lib of libByName(pieces).values()) counts[lib] = (counts[lib] ?? 0) + 1;
  return counts;
}

// importa -> lib deve ser função bem definida (um caminho de import nunca aponta
// para dois libs). Retorna a lista de caminhos que violam isso.
export function importLibConflicts(pieces) {
  const byImport = new Map();
  for (const p of pieces) {
    if (!byImport.has(p.importa)) byImport.set(p.importa, new Set());
    byImport.get(p.importa).add(p.lib);
  }
  return [...byImport.entries()]
    .filter(([, libs]) => libs.size > 1)
    .map(([importa, libs]) => ({ importa, libs: [...libs] }));
}

// Colisões de nome (mesmo nome, libs diferentes) encontradas no catálogo.
export function nameCollisions(pieces) {
  const byName = new Map();
  for (const p of pieces) {
    if (!byName.has(p.nome)) byName.set(p.nome, new Set());
    byName.get(p.nome).add(p.lib);
  }
  return [...byName.entries()]
    .filter(([, libs]) => libs.size > 1)
    .map(([nome, libs]) => ({ nome, libs: [...libs].sort() }));
}

// Referências de trilha de receita que não resolvem para nenhuma peça
// (após separar nomes compostos por " + " e ignorar tokens genéricos).
export function danglingTrackRefs(cat) {
  const known = new Set(getPieces(cat).map((p) => p.nome));
  const bad = [];
  for (const receita of cat.receitas ?? []) {
    for (const trilha of receita.trilhas ?? []) {
      const tokens = String(trilha.nome).split(" + ").map((t) => t.trim());
      for (const token of tokens) {
        if (NON_PIECE_TRACK_TOKENS.has(token)) continue;
        if (!known.has(token)) bad.push({ receita: receita.id, trilha: trilha.nome, token });
      }
    }
  }
  return bad;
}

// Normaliza para busca: minúsculas e sem acento ("transição" -> "transicao").
export function normalize(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Consulta por intenção: casa o termo no campo `quando` (case- e acento-insensitive).
export function findByIntent(pieces, query) {
  const q = normalize(query);
  return pieces.filter((p) => normalize(p.quando ?? "").includes(q));
}

export function findByName(pieces, name) {
  const q = String(name).toLowerCase();
  return pieces.filter((p) => (p.nome ?? "").toLowerCase() === q);
}
