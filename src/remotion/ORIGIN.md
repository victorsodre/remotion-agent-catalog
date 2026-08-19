# Origem destes arquivos

`src/remotion/` e `src/compositions/` foram instalados com:

```
npx remotion-ui@latest add <nome> -y
```

Não são AUTORAL. O campo `lib` do `catalog.json` é a fonte da verdade.
Para reinstalar (sem editar `src/Root.tsx` à mão depois — o CLI tenta
injetar `<Composition>`), rode `npm run libs` e confira o `Root.tsx`.
