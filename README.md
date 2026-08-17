# remotion-agent-catalog

> 🇬🇧 [English version](./README.en.md)

**A camada que falta entre um agente e um projeto Remotion de verdade.**

As [Agent Skills oficiais](https://www.remotion.dev/docs/ai/skills) ensinam um agente **como** usar o
framework. Este repositório resolve as outras duas perguntas que ele faz antes de escrever a primeira
linha: **o que já existe pronto** e **onde isso quebra**.

```
Agent Skills  →  como escrever Remotion corretamente
catalog.json  →  o que já existe neste projeto, e de onde veio cada peça
AGENTS.md     →  onde quebra, e como o defeito se manifesta
```

Nada aqui substitui as skills oficiais. Instale as duas coisas.

---

## O que tem aqui

**`catalog.json`** — índice de **102 peças** usadas em produção, cada uma com procedência, caminho de
import e uma linha de *quando usar*. É o arquivo que o agente lê antes de escrever, para parar de
reinventar o que já existe.

| origem | peças |
|---|---|
| [RemotionUI](https://remotionui.com) | 68 |
| **autoral** (escrito aqui) | 20 |
| [remotion-bits](https://www.npmjs.com/package/remotion-bits) (MIT) | 10 |
| [remocn](https://remocn.dev) | 4 |

Sessenta e oito de cento e duas vieram de uma biblioteca. Esse número é o ponto: o valor não está em
ter escrito tudo, está em ter **testado, catalogado e documentado onde quebra**. O RemotionUI sozinho
tem 200 componentes — as 68 aqui são as que sobreviveram ao uso real.

**`AGENTS.md`** — as seis armadilhas do Remotion que este projeto descobriu quebrando alguma coisa.
Nenhuma delas dá erro claro; a maioria falha em silêncio. Inclui a verificação de quais delas as
skills oficiais já cobrem (uma coberta, três parciais, uma não coberta, uma fora de escopo).

---

## Ferramentas

O `catalog.json` não é só um arquivo pra ler — é consultável e validado.

```bash
npm install

# consulta por intenção (é o ponto: descreva o que quer, receba o caminho de import)
npx remotion-catalog find "transição"
npx remotion-catalog show Typewriter
npx remotion-catalog stats
npx remotion-catalog libs Remocn
npx remotion-catalog recipes

# valida catalog.json contra o JSON Schema + os invariantes que a doc promete
npm run validate

# roda os testes (biblioteca, validador, CLI, servidor MCP)
npm test
```

### Servidor MCP

Um agente pode consultar o catálogo pelo [Model Context Protocol](https://modelcontextprotocol.io)
em vez de ler o JSON inteiro. Ferramentas: `find_by_intent`, `show_piece`, `catalog_stats`.

```jsonc
// config MCP (ex.: Cursor / Claude Desktop)
{
  "mcpServers": {
    "remotion-catalog": { "command": "npx", "args": ["-y", "remotion-catalog-mcp"] }
  }
}
```

### Validação (CI)

`npm run validate` garante, a cada push e PR, que o `catalog.json`:

- é válido contra [`schema/catalog.schema.json`](./schema/catalog.schema.json);
- tem exatamente **102** nomes únicos e a tabela por lib acima (68/20/10/4);
- mantém no máximo **4 itens por página** (a grade fixa);
- mantém `caminho de import → lib` como função bem definida (um import nunca aponta para dois libs);
- não introduz **nenhuma colisão de nome nova** além do único caso conhecido e legítimo (`Typewriter`,
  que existe em RemotionUI e Remocn);
- não tem **nenhuma referência de trilha pendurada** nas receitas.

É o que transforma a promessa de honestidade ("os números são contados, não estimados") em algo que a
máquina verifica.

---

## Como usar

Coloque os dois arquivos na raiz do seu projeto Remotion. Agentes que leem `AGENTS.md`
automaticamente (Claude Code, Cursor, Codex) passam a consultar o catálogo antes de escrever.

```bash
curl -O https://raw.githubusercontent.com/victorsodre/remotion-agent-catalog/main/AGENTS.md
curl -O https://raw.githubusercontent.com/victorsodre/remotion-agent-catalog/main/catalog.json
```

Instale também as skills oficiais — elas cobrem a camada de baixo:

```bash
npx skills add remotion-dev/skills
```

### Adaptando ao seu projeto

O `catalog.json` é **gerado**, nunca editado à mão: ele deriva das páginas do catálogo no código
(`npm run catalog`). Se for reaproveitar em outro projeto, o que interessa é o **formato**:

```json
{
  "nome": "FrostedGlassWipe",
  "lib": "RemotionUI",
  "importa": "@/remotion/primitives/frosted-glass-wipe",
  "quando": "transição entre cenas — o vidro borra o que fica atrás",
  "ciclo": 90
}
```

Quatro campos e uma frase de intenção. O campo `quando` é o que mais rende: é por ele que o agente
escolhe a peça certa, não pelo nome.

O campo `lib` não é decoração — é o que impede um agente (ou você) de atribuir a autoria errada.
Em caso de conflito entre memória e catálogo, **o catálogo ganha**.

---

## A vertical Brasil

Vinte das 102 peças são autorais, e doze delas existem por um motivo específico: **as bibliotecas de
componentes para Remotion são todas do mercado americano.** Nos 200 componentes do RemotionUI não há
PIX, boleto, parcelamento, frete grátis, CDC, CNPJ/nota fiscal nem WhatsApp — que é onde a venda
brasileira de fato acontece.

`PixQr` · `BoletoPix` · `Parcelamento` · `CarrinhoResumo` · `FreteGratis` · `Cupom` ·
`EstoqueRestante` · `PrazoEntrega` · `AvaliacaoNota` · `SeloGarantia` · `SeloEmpresa` ·
`WhatsappConversa`

Detalhes que só aparecem quando a peça é escrita por quem vende aqui: o `Parcelamento` calcula juros
compostos de verdade acima do limite sem juros (a linha com juros **precisa** ficar visivelmente pior);
o `SeloGarantia` cita o art. 49 do CDC por artigo, porque no Brasil os 7 dias não são cortesia da loja,
são lei — e citar a lei converte melhor que "garantia total", além de ser verdade.

---

## Honestidade

- **Não republico código de terceiros.** As peças do RemotionUI e do remocn são copiadas para o
  projeto pelo CLI de cada uma (modelo shadcn) e seguem as licenças originais. Aqui vai só o índice
  e a documentação — escritos por mim.
- **Os números são contados, não estimados.** 102 peças = nomes únicos no `catalog.json`. Confira você mesmo.
- **A verificação das skills** foi feita lendo o conteúdo real do repositório oficial no commit `9f0faa5`,
  não a página de marketing. Se o Remotion cobrir a armadilha 4 numa versão futura, esta tabela fica
  desatualizada — abra uma issue.

## Licença

MIT para o conteúdo deste repositório (`AGENTS.md`, `catalog.json`, `README.md`). As bibliotecas
citadas têm licenças próprias: [Remotion](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)
usa licença de dois níveis (grátis para indivíduos e organizações pequenas, licença de empresa acima
disso). Verifique a sua situação antes de usar em produção.

---

Feito por [@ovictor](https://x.com/ovictor). Método, não hype.
