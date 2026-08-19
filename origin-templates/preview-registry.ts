// VAI NA ORIGEM (src/preview-registry.ts) — não é buildado no repo do catálogo.
//
// Mapa de `importa` (e/ou `nome`) -> componente React da peça. A origem já
// importa esses componentes para montar as páginas do catálogo; reaproveite os
// mesmos imports aqui. Chaveie por `importa` porque é único e desambigua
// colisões de nome (ex.: os dois Typewriter).
//
// Cada valor é um componente que se renderiza sozinho com props razoáveis de
// demonstração (texto de exemplo, cores do tema). Se a peça exigir `fontSize`
// explícito (armadilha 3 do AGENTS.md), passe aqui.

import type React from "react";

// Exemplos — substitua/complete com os imports reais da sua origem:
import { BlurFocusIn } from "@/remotion/primitives/blur-focus-in";
import { Typewriter as TypewriterUI } from "@/remotion/primitives/typewriter";
import { Typewriter as TypewriterRemocn } from "@/components/remocn/typewriter";
// ... importe as demais peças ...

export const PREVIEW_REGISTRY: Record<string, React.FC> = {
  "@/remotion/primitives/blur-focus-in": () => <BlurFocusIn>Preview</BlurFocusIn>,
  "@/remotion/primitives/typewriter": () => <TypewriterUI text="npm run catalog" />,
  "@/components/remocn/typewriter": () => <TypewriterRemocn text="npm run catalog" />,
  // ... uma entrada por peça, chaveada pelo campo `importa` do catalog.json ...
};
