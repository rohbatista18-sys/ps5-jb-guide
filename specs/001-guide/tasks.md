# Tasks — Spec 001 (PS5 JB Guide)

Legenda:
- `[P]` = pode rodar em paralelo.
- `[TL]` = tech lead (integração/decisão).
- `[C]` = conteúdo (pesquisa + texto).
- `[D1]`/`[D2]` = devs.
- `[US#]` = história atendida.
- **⛔ aprovação** = só executar com OK explícito do usuário.

## Fase 0 — Decisões (antes de qualquer código)
- [x] T000 [TL] Usuário responde os Esclarecimentos 1–6 da `spec.md` (2026-10-29: lojas após revisão, passos próprios + README, `ps5-jb-guide.vercel.app`, repo privado, link cruzado após o deploy, relatado com selo).
- [ ] T001 [TL] Congelar a constituição (`.specify/memory/constitution.md`) com as respostas.

## Fase 1 — Fundação (Tech Lead)
- [x] T010 [TL] `create-next-app` 16.4.3 em `ps5-jb-guide/`, `git init`, autor noreply. Ler `node_modules/next/dist/docs/` (MDX, cacheComponents, proxy, i18n).
- [x] T011 [TL] `next.config.ts`: cacheComponents + partialPrefetching + headers/CSP do tracker + `createMDX` (sem plugins). Criar `src/mdx-components.tsx`.
- [x] T012 [TL] Copiar do tracker: `globals.css` (sem stage/PixelCrowd), `i18n/config.ts`, `proxy.ts`, `PsButtons`, `LanguageSwitcher`, `CopyButton` e `NewsDialog` → `Dialog`.
- [x] T013 [TL] `[lang]/layout.tsx`: fontes, `generateStaticParams(LOCALES)`, `notFound()`, metadata com hreflang, header vazio e footer (sem fins lucrativos, privacidade, aviso de doação).

## Fase 2 — Modelo de conteúdo e validação
- [x] T020 [D1] Tipos TS + `lib/content.ts` + `lib/version.ts` (parse `9.6`→`9.60`, comparar, `findRange`). Testes unitários do parse e das bordas (`13.60` vs `14.00`). (2026-10-29)
- [x] T021 [P][D1] `scripts/check-content.mjs` (prebuild) falha em:
  - faixas sobrepostas;
  - faixa sem MDX EN;
  - `<Repo>` não listed;
  - `<Claim>` sem `src`;
  - `src` inexistente em `sources.json`;
  - slug duplicado. (2026-10-29: JSON e tags `<Repo>`/`<Claim>` nos MDX; testado com um MDX inválido temporário.)
- [x] T022 [P][D2] `scripts/verify-repos.mjs` (`npm run verify:repos`): snapshot e heurísticas de golpe (FR-021/FR-024), mais o `verify-report.md`. (2026-10-29: rodado contra a API, 29/29 ok, 0 erros.)
- [x] T023 [P][D2] `.github/workflows/verify-repos.yml`: semanal + manual. Abre um PR e nunca faz merge. (2026-10-29)
- [x] T024 [TL] Seed de `repos.json` a partir da tabela do `plan.md`. **Re-verificado cada id** com `gh api repos/<id>`. (2026-10-29)

## Fase 3 — Pesquisa de conteúdo (cada fato com fonte e selo)
- [ ] T030 [C] Tabela completa de faixas de firmware (≤4.51 … 13.60) com fonte primária por faixa, entry point, HEN/loader e se é persistente. Lacunas viram "sem método público".
- [ ] T031 [P][C] Rótulos oficiais da Sony em EN/PT-BR/ES para:
  - ver a versão do sistema;
  - desligar a atualização automática;
  - as opções do Modo de Segurança e o que cada uma apaga.

  Usar só páginas de suporte da Sony como fonte.
- [ ] T032 [P][C] Fontes do anúncio do Prolapse (14.00–14.10) e do demo privado do Gezine no 14.10. Selo "relatado".
- [ ] T033 [P][C] Erros comuns: sintoma, causa, solução e quando parar, com fonte. Lista mínima da US7.
- [ ] T034 [P][C] Guias do menu (pacotes, apps/homebrew, payloads, FTP, backup dos próprios jogos, emuladores): pré-requisitos e repos, sem nenhuma referência a obtenção de jogos de terceiros.
- [ ] T035 [TL] Revisão humana dos repos em `review`: README, releases e golpe. Marcar `listed`/`excluded` com motivo.

## Fase 4 — UI (paralela, depois da Fase 2)
- [ ] T040 [P][D1][US1][US2] `FirmwarePicker` (input `X.YY` + grade de faixas com `StatusBadge`) e modal "Como descobrir?" com `MenuPath` em pixel-art.
  - 2026-10-29: picker + grade + `StatusBadge` prontos e testados no navegador (inválido, mais novo que 14.10, lacuna, `9.6` → `/fw/7.00-13.60`). **Falta** o modal "Como descobrir?" + `MenuPath`, que depende dos rótulos oficiais da Sony (T031).
- [x] T041 [P][D2][US6] `SiteMenu`: dropdowns Firmware/Guias acessíveis por teclado (`aria-expanded`, Esc fecha) e menu único ≤639 px. (2026-10-29: Esc devolve o foco, clique fora e navegação fecham, `aria-current`; testado no navegador em desktop e 360 px.)
- [ ] T042 [P][D1][US3] `fw/[range]/page.tsx`: StatusBadge → Checklist → precisa → MDX → funcionou → reboot → `RepoCard`s → erros da faixa → fontes.
  - 2026-10-29: rota estática por faixa com StatusBadge, aviso de rascunho, MDX (EN como fallback), claims com selo e fonte, `RepoCard`s e fontes. Conteúdo da faixa dentro de `<Suspense>` (validação de navegação instantânea do Next 16.4). **Falta** Checklist, "funcionou?", "depois de reiniciar" e erros da faixa (dependem de T030/T033).
- [ ] T043 [P][D2][US4] Variante `status: none` (14.00–14.10 e >latest): texto honesto, relatados com selo e botão para o tracker.
  - 2026-10-29: bloco "sem jailbreak público" + botão do tracker na página da faixa; versões > latest recebem a mensagem no picker. **Falta** os relatos com selo (T032).
- [x] T044 [P][D1][US5] `RiskStrip` (todas as páginas) + `/riscos`. (2026-10-29: `risks.mdx` EN/ES/PT com `<Warn>`, só conselhos cautelosos; caminhos de menu da Sony e o que cada opção do Modo de Segurança apaga entram com fonte na T031.)
- [ ] T045 [P][D2][US7] `/erros`: lista com filtro client-side por sintoma + `/erros/[slug]`.
  - 2026-10-29: lista + filtro (ignora acento e caixa) prontos, testados com entradas temporárias já removidas. **Falta** `/erros/[slug]`: o Cache Components não aceita `generateStaticParams` vazio, então a rota entra junto com o primeiro erro (T033). O `check-content` falha se houver erro sem a rota.
- [ ] T046 [P][D1][US6] `/guias` + `/guias/[slug]`.
  - 2026-10-29: `/guias` com as 6 seções (âncoras do menu) e estado vazio. **Falta** `/guias/[slug]`, pelo mesmo motivo (T034).
- [x] T047 [P][D2][US9] `Claim`, `RepoCard` (texto só, sem avatar; "verificado em" e aviso se o snapshot tiver mais de 14 dias) e "última revisão" por página. (2026-10-29: ambos registrados no MDX; `RepoCard` e aviso de 14 dias conferidos no navegador com um `listed` temporário, já revertido.)
- [x] T048 [P][D1] `sitemap.ts` (com alternates por idioma), `robots.ts` e `opengraph-image.tsx` pixel. (2026-10-29: 18 URLs com hreflang; OG por idioma com os símbolos em SVG, mas em fonte do sistema, não a pixel, para o build não baixar fonte.)

## Fase 5 — Conteúdo escrito
- [ ] T050 [C] MDX EN de cada faixa, de `no-public`, `risks`, `check-firmware`, `about`, guias e erros, a partir das Tarefas T030–T034.
- [ ] T051 [P][C] Traduções PT-BR e ES. Faltas caem para EN com o aviso "Tradução pendente".
- [ ] T052 [TL] Revisão de honestidade: grep por "funciona", "garantido", "em breve" e "100%". Toda `Claim` tem fonte acessível.

## Fase 6 — Qualidade
- [ ] T060 [TL] `next build` limpo; `check-content` e `verify:repos` verdes.
- [ ] T061 [P][TL] Testar em 360 px, teclado só, reduced-motion e contraste AA.
- [ ] T062 [P][TL] Aba Network sem terceiros; cookies só `lang`; JS da primeira carga < 100 KB; LCP < 1,5 s (Lighthouse).
- [ ] T063 [TL] Rodar local e mostrar ao usuário (screenshots EN/ES/PT) para aprovação.

## Fase 7 — Publicação (⛔ aprovação a cada passo)
- [ ] T070 [TL] ⛔ Criar o repo **privado** `rohbatista18-sys/ps5-jb-guide` e fazer o push (autor noreply).
- [ ] T071 [TL] ⛔ Criar o projeto Vercel `ps5-jb-guide`. Desligar Analytics, Speed Insights e Log Drains. Produção = `main`.
- [ ] T072 [TL] Pós-deploy: redirect `/`, hreflang, sitemap, headers (securityheaders) e Network.
- [ ] T073 [TL] ⛔ (outro repo) Botão "Guia para iniciantes" no tracker, que linka o guia, e no guia o link de volta.
