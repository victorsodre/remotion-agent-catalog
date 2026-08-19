import path from "path";
import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./src/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

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
