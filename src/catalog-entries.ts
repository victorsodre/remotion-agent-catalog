import type { CatalogPieceProps } from "./CatalogPiece";
import catalog from "../catalog.json";
import { liveKey } from "./demos";

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "peca";

export type CatalogEntry = CatalogPieceProps & {
  id: string;
  folder: string;
  liveKey: string;
  durationInFrames: number;
};

export function catalogEntries(): CatalogEntry[] {
  const used = new Set<string>();
  const uniqueId = (base: string) => {
    let id = base.replace(/[^A-Za-z0-9-]/g, "-");
    if (!/^[A-Za-z]/.test(id)) id = `P-${id}`;
    let n = 2;
    let out = id;
    while (used.has(out)) out = `${id}-${n++}`;
    used.add(out);
    return out;
  };

  const out: CatalogEntry[] = [];
  for (const pg of catalog.paginas) {
    for (const it of pg.itens) {
      out.push({
        id: uniqueId(slug(`${it.nome}-${it.lib}`)),
        folder: pg.id,
        liveKey: liveKey(pg.id, it.nome),
        nome: it.nome,
        lib: it.lib,
        quando: it.quando,
        preview: "preview" in it && typeof it.preview === "string" ? it.preview : null,
        durationInFrames: Math.max(30, it.ciclo ?? 90),
      });
    }
  }
  for (const v of catalog.verticais) {
    out.push({
      id: uniqueId(slug(`${v.nome}-${v.lib}`)),
      folder: "Verticais",
      liveKey: liveKey("Verticais", v.nome),
      nome: v.nome,
      lib: v.lib,
      quando: v.quando,
      preview: "preview" in v && typeof v.preview === "string" ? v.preview : null,
      durationInFrames: Math.max(30, v.duracao ?? 90),
    });
  }
  return out;
}
