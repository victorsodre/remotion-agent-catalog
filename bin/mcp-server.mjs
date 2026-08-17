#!/usr/bin/env node
// Servidor MCP: expõe o catálogo como ferramentas que um agente chama por conta
// própria, em vez de ler 40 KB de JSON. Comunicação por stdio.
//
//   remotion-catalog-mcp   (ou: npm run mcp)
//
// Ferramentas:
//   find_by_intent(query)   peças cuja intenção (quando) casa o termo
//   show_piece(name)        detalhe da(s) peça(s) com esse nome
//   catalog_stats()         contagens (total, por lib, seções)

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  loadCatalog,
  getPieces,
  uniqueNames,
  libCounts,
  findByIntent,
  findByName,
  LIBS,
} from "../scripts/catalog-lib.mjs";

const cat = loadCatalog();
const pieces = getPieces(cat);
const slim = ({ nome, lib, importa, quando, ciclo, duracao, origem }) => ({
  nome, lib, importa, quando, ...(ciclo ? { ciclo } : {}), ...(duracao ? { duracao } : {}), origem,
});
const json = (obj) => ({ content: [{ type: "text", text: JSON.stringify(obj, null, 2) }] });

const TOOLS = [
  {
    name: "find_by_intent",
    description:
      "Busca peças Remotion pela intenção (campo `quando`). Passe o que você quer fazer (ex.: 'transição', 'gráfico de barras', 'gancho de reel') e receba nome, lib de origem e caminho de import.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Termo de intenção a casar no campo quando." } },
      required: ["query"],
    },
    run: (a) => json(findByIntent(pieces, a.query ?? "").map(slim)),
  },
  {
    name: "show_piece",
    description:
      "Mostra a(s) entrada(s) de uma peça pelo nome exato (inclui colisões legítimas como Typewriter, que existe em RemotionUI e Remocn).",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Nome exato da peça." } },
      required: ["name"],
    },
    run: (a) => json(findByName(pieces, a.name ?? "").map(slim)),
  },
  {
    name: "catalog_stats",
    description: "Contagens do catálogo: total de entradas, nomes únicos, por lib e por seção.",
    inputSchema: { type: "object", properties: {} },
    run: () =>
      json({
        entradas: pieces.length,
        nomesUnicos: uniqueNames(pieces).length,
        porLib: libCounts(pieces),
        paginas: cat.paginas.length,
        verticais: cat.verticais.length,
        escolhas: cat.escolhas.length,
        receitas: cat.receitas.length,
        libs: LIBS,
      }),
  },
];

const server = new Server(
  { name: "remotion-agent-catalog", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = TOOLS.find((t) => t.name === req.params.name);
  if (!tool) {
    return { content: [{ type: "text", text: `ferramenta desconhecida: ${req.params.name}` }], isError: true };
  }
  try {
    return tool.run(req.params.arguments ?? {});
  } catch (err) {
    return { content: [{ type: "text", text: `erro: ${err.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("remotion-agent-catalog MCP server pronto (stdio).");
