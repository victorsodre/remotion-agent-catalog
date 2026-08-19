# Como gravar as prévias que faltam

O visualizador lê **só esta pasta**. Solte o vídeo com o **nome exato** da lista
`FALTAM.md` (ao lado). Formatos: `.webm` (melhor), `.mp4` ou `.gif`.

Depois, no repo do catálogo:

```bash
node scripts/link-previews.mjs
```

Isso preenche o campo `preview` no `catalog.json`. Aí é só avisar — eu publico.

## Ligar o projeto de origem (Remotion Studio)

As peças existem **no outro projeto** (o Remotion com `src/` e Studio), não neste.
Você grava **de lá** e salva **aqui**.

1. Abra o terminal **na pasta do projeto Remotion de origem** (onde você roda o Studio).
2. Suba o Studio:

```bash
npx remotion studio
```

3. No menu da esquerda, clique na composição da peça.
4. Clique em **Render**.
5. Em **Output location**, aponte para esta pasta:

```
/Users/victor/ovictor/remotion-agent-catalog/web/previews/<NOME-EXATO>.webm
```

6. Codec: **VP8 / WebM** (se não tiver, H.264 / MP4 também serve).
   Scale **0.5** (vídeo pequeno, ~100–200 KB). Duração = o `ciclo` da peça.

Pode gravar **um por um**. Não precisa de git, push, nem script de lote.

## Atalho de terminal (uma peça)

Ainda na origem, se você souber o **id da composition** no Studio:

```bash
npx remotion render <IdDaComposition> \
  "/Users/victor/ovictor/remotion-agent-catalog/web/previews/<NOME-EXATO>.webm" \
  --codec=vp8 --scale=0.5
```

Exemplo, se no Studio a peça PixQr se chama `PixQr`:

```bash
npx remotion render PixQr \
  "/Users/victor/ovictor/remotion-agent-catalog/web/previews/PixQr-Autoral.webm" \
  --codec=vp8 --scale=0.5
```

## Depois de alguns arquivos na pasta

```bash
cd /Users/victor/ovictor/remotion-agent-catalog
node scripts/link-previews.mjs
node scripts/link-previews.mjs --list   # só ver o que ainda falta
```

Me avisa quando tiver um lote (nem precisa ser tudo). Eu publico no site.
