import path from "path";
import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./src/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// GPU primitives (`MeshGradientBg` e o resto em `gpu.ts`) saem chapados
// sem isso — o still ainda “passa”. Ver AGENTS.md.
Config.setChromiumOpenGlRenderer("angle");

// O alias @/ precisa estar em tsconfig.json E aqui — só o tsconfig faz o
// typecheck passar e o render quebrar. Ver AGENTS.md, regras do ambiente.
Config.overrideWebpackConfig((current) => ({
  ...current,
  resolve: {
    ...current.resolve,
    alias: {
      ...current.resolve?.alias,
      "@": path.join(process.cwd(), "src"),
    },
  },
}));
