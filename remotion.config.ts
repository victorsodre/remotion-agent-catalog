import path from "path";
import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./src/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// GPU primitives (`MeshGradientBg` e o resto em `gpu.ts`) precisam de um
// backend GL. `swangle` funciona headless (Cloud Agent / CI sem GPU);
// `angle` é mais rápido com placa. Sem isso o still sai chapado ou o
// WebGL2 context falha. Ver AGENTS.md.
Config.setChromiumOpenGlRenderer("swangle");

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
