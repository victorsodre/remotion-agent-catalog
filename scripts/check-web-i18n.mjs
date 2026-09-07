import fs from "node:fs";
import vm from "node:vm";

const catalog = JSON.parse(fs.readFileSync(new URL("../catalog.json", import.meta.url), "utf8"));
const source = fs.readFileSync(new URL("../web/i18n.js", import.meta.url), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "web/i18n.js" });
const maps = context.window.CATALOG_I18N?._intentMaps;
if (!maps) throw new Error("English intent maps were not exposed by web/i18n.js");

const entries = [
  ...(catalog.paginas ?? []).flatMap((page) => page.itens ?? []),
  ...(catalog.verticais ?? []),
];
const missing = entries.filter((entry) => !maps.byKey[entry.id ?? entry.importa] && !maps.bySource[entry.quando]);
if (missing.length) {
  throw new Error(`Missing English intent translations:\n${missing.map((entry) => `${entry.id ?? entry.importa}: ${entry.quando}`).join("\n")}`);
}
const recipeIds = new Set(catalog.receitas?.map((recipe) => recipe.id));
const enRecipes = /const enRecipeSummaries = \{([\s\S]*?)\n  \};/.exec(source)?.[1] ?? "";
const missingRecipes = [...recipeIds].filter((id) => !new RegExp(`\\b${id}:`).test(enRecipes));
if (missingRecipes.length) throw new Error(`Missing English recipe summaries: ${missingRecipes.join(", ")}`);
console.log(`OK — ${entries.length} component intents and ${recipeIds.size} recipe summaries have explicit English mappings.`);
