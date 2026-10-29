# Constituição — PS5 JB Guide

Rascunho de 2026-10-29. Herda o espírito da constituição do `ps5-jb-tracker`.

## I. Segredos nunca chegam ao cliente
Não há `NEXT_PUBLIC_` com credenciais e `.env*` fica no gitignore. O único segredo, o `GITHUB_TOKEN`, vive só na GitHub Action.

## II. Degradação graciosa
Um repo sem snapshot ou um texto sem tradução nunca quebra a página: cai para o EN com aviso ou some da lista. A exceção são as regras de conteúdo dos princípios III e VII (selo sem fonte, repo não verificado), que **quebram o build** de propósito.

## III. Precisão factual (não exagerar)
Toda afirmação técnica tem selo **comprovado** (fonte primária) ou **relatado** (notícia/fórum). Sem fonte, não publica. Nunca escrever "funciona", "em breve" ou "100% seguro" sem fonte.

## IV. Leve e acessível
O site é estático, com < 100 KB de JS na primeira carga, contraste AA, foco visível, `prefers-reduced-motion`, funciona em 360 px e menus operáveis por teclado.

## V. Simplicidade
App Router + TypeScript + MDX. Sem banco, sem CMS e sem dependências de runtime além de next/react/mdx. O conteúdo é arquivo versionado no git.

## VI. Privacidade
Sem analytics, contadores, terceiros no navegador ou cookies além de `lang`. O site não tem fins lucrativos.

## VII. Só fonte verificada
Repos só aparecem com snapshot da API do GitHub e revisão humana registrada. Ninguém (pessoa ou IA) adiciona um repo de memória: todo `owner/repo` é conferido em `GET /repos/{owner}/{repo}` antes de entrar no JSON.

## VIII. Sem pirataria
O site ensina o jailbreak do próprio console, homebrew e backup dos próprios jogos. Não linka nem ensina a obter jogos de terceiros. Lojas e "download managers" só entram após revisão explícita, e só se o catálogo for apenas homebrew. As noticiadas como pirataria ficam de fora.

## IX. Publicação só com aprovação
Nenhum push, criação de repo, deploy ou merge automático sem o OK do mantenedor. A Action semanal só abre PR.
