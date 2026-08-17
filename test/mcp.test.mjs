import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const SERVER = join(HERE, "..", "bin", "mcp-server.mjs");

async function withClient(fn) {
  const transport = new StdioClientTransport({ command: process.execPath, args: [SERVER] });
  const client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(transport);
  try {
    return await fn(client);
  } finally {
    await client.close();
  }
}

test("MCP: lista as três ferramentas", async () => {
  await withClient(async (client) => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    assert.deepEqual(names, ["catalog_stats", "find_by_intent", "show_piece"]);
  });
});

test("MCP: find_by_intent retorna peças casando a intenção", async () => {
  await withClient(async (client) => {
    const res = await client.callTool({ name: "find_by_intent", arguments: { query: "gancho" } });
    const data = JSON.parse(res.content[0].text);
    assert.ok(Array.isArray(data) && data.length >= 1);
    assert.ok(data.every((p) => p.quando.toLowerCase().includes("gancho")));
    assert.ok(data.every((p) => p.importa && p.lib));
  });
});

test("MCP: catalog_stats bate com o esperado", async () => {
  await withClient(async (client) => {
    const res = await client.callTool({ name: "catalog_stats", arguments: {} });
    const data = JSON.parse(res.content[0].text);
    assert.equal(data.nomesUnicos, 102);
    assert.deepEqual(data.porLib, { RemotionUI: 68, Autoral: 20, Bits: 10, Remocn: 4 });
  });
});
