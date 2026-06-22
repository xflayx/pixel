# conta·a·conta

Site que transforma uma imagem com fundo transparente em um molde de pixel
para montar com contas (hama beads / pearl beads), com a lista de quantas
contas de cada cor você precisa.

## Como funciona

1. Você sobe uma imagem PNG com fundo transparente.
2. O app divide a imagem em uma grade (do tamanho da placa escolhida) e
   calcula a cor média de cada célula, ignorando as áreas transparentes.
3. Cada célula é convertida para a cor de conta mais próxima (usando
   distância no espaço de cor Lab, mais fiel à percepção humana que RGB puro).
4. O resultado é desenhado como bolinhas (imitando o pegboard de verdade) e
   uma lista lateral mostra quantas contas de cada cor são necessárias.

Tudo é processado no navegador (client-side) — nenhuma imagem é enviada
para um servidor.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000

## Deploy no Vercel

1. Suba esta pasta para um repositório no GitHub (ou GitLab/Bitbucket).
2. Em https://vercel.com, clique em "Add New… → Project" e importe o
   repositório.
3. O Vercel detecta automaticamente que é um projeto Next.js — não precisa
   mudar nenhuma configuração de build.
4. Clique em "Deploy".

Ou, com a CLI do Vercel já instalada:

```bash
npm install -g vercel
vercel
```

## Ajustando a paleta de cores

A paleta aproximada das contas está em `lib/palettes.ts`. Para usar as
cores exatas de uma marca específica (Hama, Perler, Artkal etc.), basta
editar essa lista com os hex corretos do catálogo da marca/fornecedor.

## Possíveis próximos passos

- Permitir trocar de paleta (Hama midi, Hama mini, Perler, Artkal) no app.
- Exportar a lista de contas em PDF para imprimir como referência.
- Numerar as linhas/colunas no molde para facilitar a montagem.
