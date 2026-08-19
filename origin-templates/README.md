# origin-templates — kit de render de prévias

**Estes arquivos NÃO rodam neste repositório.** Eles vão no **projeto Remotion de origem**
(o que tem `src/`, `remotion.config.ts` e os componentes de verdade), porque só lá existe o
código das peças para renderizar. Aqui no `remotion-agent-catalog` fica só o `catalog.json` +
o visualizador, que já sabe mostrar o campo opcional `preview` quando ele existe.

## Objetivo

Renderizar uma prévia curta (`.webm`) de cada peça do `catalog.json` e gravar o caminho no
campo `preview`. Depois é só copiar os `.webm` para `web/previews/` **neste** repo e commitar o
`catalog.json` atualizado — o site publicado passa a mostrar o efeito real, já paginado.

## Passos na origem

1. Copie `Preview.tsx` + `preview-registry.ts` para `src/` e preencha o `PREVIEW_REGISTRY`
   (mapa `importa`/`nome` → componente). A origem já importa esses componentes nas páginas do
   catálogo, então o registro é montado a partir dos mesmos imports.
2. Registre a composition no seu `Root.tsx` (veja `register-preview.tsx`).
3. Copie `render-previews.mjs` para `scripts/` e rode apontando para o clone do repo do
   catálogo (ele renderiza **direto** em `web/previews/` e atualiza o `catalog.json` de lá):

   ```bash
   ENTRY=src/index.ts \
   CATALOG_DIR=/caminho/para/remotion-agent-catalog \
   node scripts/render-previews.mjs
   ```
4. No repo do catálogo, commite e publique (o script imprime esse comando no fim):

   ```bash
   cd /caminho/para/remotion-agent-catalog
   git add web/previews catalog.json
   git commit -m "feat: previas renderizadas"
   git push origin main
   ```

## Cuidados (das seis armadilhas)

- **Mapas não renderizam headless** (`maplibre-gl`/WebGL2): pule peças de mapa (o script já
  ignora `PAGINA_MAPAS`/`importa` com `mapa`).
- **`defaultProps` passa por JSON**: `Preview` recebe só `nome`/`importa` (strings), nunca JSX.
- **`useVideoConfig()` reporta a composição**: a `Preview` é uma composition de verdade (não
  uma célula reduzida por transform), então componentes que leem `useVideoConfig()` recebem as
  dimensões reais da prévia — sem cair na armadilha 1.
- **Colisão de nome legítima** (`Typewriter` em RemotionUI e Remocn): o registro é chaveado por
  `importa` (único), e o nome do arquivo usa `nome+lib` para não colidir.
