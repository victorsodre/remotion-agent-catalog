// VAI NA ORIGEM (dentro do seu Root.tsx) — não é buildado no repo do catálogo.
//
// Registre UMA composition "Preview". A duração/dimensão são sobrescritas por
// peça no render (renderMedia recebe durationInFrames/width/height). defaultProps
// só com strings (armadilha 3).

import { Composition } from "remotion";
import { Preview } from "./Preview";

export const PreviewComposition = () => (
  <Composition
    id="Preview"
    component={Preview}
    durationInFrames={90}
    fps={30}
    width={960}
    height={540}
    defaultProps={{
      nome: "BlurFocusIn",
      importa: "@/remotion/primitives/blur-focus-in",
    }}
  />
);
