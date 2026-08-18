# web/previews

Coloque aqui os `.webm` (ou `.mp4`/`.gif`) das **prévias reais** renderizadas no projeto de
origem (veja `origin-templates/`). Os caminhos são referenciados pelo campo `preview` de cada
peça no `catalog.json`, no formato `previews/<nome>-<lib>.webm`.

- **Local** (`npm run web`, página em `/web/`): o card resolve `previews/…` para `web/previews/…`.
- **GitHub Pages**: o workflow copia `web/previews/` para a raiz do site publicado.

Se um arquivo faltar ou falhar ao carregar, o card volta automaticamente para a prévia
ilustrativa (não quebra).
