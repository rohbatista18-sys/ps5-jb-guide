# Plano técnico — Spec 001 (PS5 JB Guide)

**Status:** Draft para aprovação · **Criado:** 2026-10-29

## Stack
- Next.js 16.4.3 + React 19.3, com App Router, TypeScript e Turbopack (padrão no 16). A mesma versão do tracker.
  - Antes de codar, ler `node_modules/next/dist/docs/` (AGENTS.md).
- `cacheComponents: true` + `partialPrefetching: true`, igual ao tracker.
  - O conteúdo é lido por `import` / `fs.readFileSync` no escopo do módulo, então tudo vira shell estático no build (docs: `01-getting-started/08-caching.md`).
  - Não usar `dynamicParams` (incompatível com cacheComponents). Param inválido → `notFound()`.
- MDX via `@next/mdx` (+ `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`), com `src/mdx-components.tsx` obrigatório.
  - Sem frontmatter (não é nativo no `@next/mdx`). Os metadados ficam nos JSON de índice; o MDX só tem o corpo.
  - Plugins remark só por nome em string (limite do Turbopack). Começar sem nenhum; `remark-gfm` só se as tabelas fizerem falta.
- CSS Modules + `globals.css` copiado do tracker (tokens, `.px-btn`, `.px-box`, CRT), sem `--stage-h`/padding do PixelCrowd. Fontes via `next/font/google`: Press Start 2P (display) e VT323 (texto).
- **Nenhuma** dependência de runtime além de next/react/mdx: sem Redis, Supabase, IA ou analytics.
- Deploy na Vercel, **sem** `output: 'export'`: o `proxy.ts` (redirect de idioma em `/`) e o `use cache` não funcionam em static export (docs: `02-guides/static-exports.md`). As páginas continuam 100% pré-renderizadas e servidas pelo CDN.

## Arquitetura
```
                 ┌──────────────── build (Vercel) ────────────────┐
content/*.json ──┤ lib/content.ts (lê + valida) ──► páginas [lang] │──► HTML estático (CDN)
content/{lang}/  │ import(`@/content/${lang}/…mdx`) ─► MDX + <Repo>│
  *.mdx ─────────┤ repos.snapshot.json ─► <RepoCard> (sem rede)    │
                 └─────────────────────────────────────────────────┘
GitHub Action semanal ─► scripts/verify-repos.mjs ─► gh api /repos/… ─► PR com diff do snapshot
                                                     (humano revisa → merge → Vercel faz deploy)
Request "/" ─► src/proxy.ts ─► 307 /{pt|es|en} (cookie → país → Accept-Language → en)
```

## Estrutura de arquivos
```
ps5-jb-guide/
├─ AGENTS.md                      (gerado pelo next dev; mesmo aviso do tracker)
├─ next.config.ts                 cacheComponents, partialPrefetching, headers/CSP do tracker, withMDX
├─ content/
│  ├─ firmware.json               faixas (fonte única do seletor)
│  ├─ repos.json                  repos + revisão humana
│  ├─ repos.snapshot.json         gerado por verify:repos (não editar à mão)
│  ├─ guides.json                 índice do menu "Guias"
│  ├─ errors.json                 índice da central de erros
│  ├─ sources.json                fontes citáveis (id → url, título, tipo, acessado em)
│  └─ {en,es,pt}/
│     ├─ fw/{rangeId}.mdx         tutorial da faixa
│     ├─ guides/{slug}.mdx
│     ├─ errors/{slug}.mdx
│     ├─ risks.mdx  check-firmware.mdx  no-public.mdx  about.mdx
├─ scripts/
│  ├─ verify-repos.mjs            GitHub API → repos.snapshot.json (falha em 404/rename)
│  └─ check-content.mjs           validação de schema/overlap/links/refs (roda no prebuild)
├─ .github/workflows/verify-repos.yml   semanal + manual, abre PR
└─ src/
   ├─ proxy.ts                    cópia do tracker (matcher sem `api`)
   ├─ mdx-components.tsx          mapeia h2/ol/a + <Claim> <Repo> <Step> <Warn> <MenuPath>
   ├─ i18n/{config.ts,dictionaries.ts}   mesmo formato do tracker (Dictionary = typeof en, fill())
   ├─ lib/content.ts              getRanges(), findRange(version), getRepos(rangeId|guide), getErrors()…
   ├─ lib/version.ts              parse "9.6" → {major:9,minor:60}; compara
   ├─ app/[lang]/layout.tsx       fontes, header/menu, faixa de risco, footer; generateStaticParams(LOCALES)
   ├─ app/[lang]/page.tsx         home: seletor + "Como descobrir?" (modal)
   ├─ app/[lang]/fw/[range]/page.tsx
   ├─ app/[lang]/guias/page.tsx, guias/[slug]/page.tsx
   ├─ app/[lang]/erros/page.tsx,  erros/[slug]/page.tsx
   ├─ app/[lang]/riscos/page.tsx, sobre/page.tsx
   ├─ app/sitemap.ts, app/robots.ts, app/[lang]/opengraph-image.tsx
   └─ components/
      ├─ (copiados do tracker) PsButtons, LanguageSwitcher, CopyButton, Dialog (= NewsDialog genérico)
      ├─ FirmwarePicker.tsx (client)  input + lista de faixas
      ├─ SiteMenu.tsx (client)        dropdowns acessíveis / menu mobile
      ├─ RiskStrip.tsx, Checklist.tsx (client), Claim.tsx, RepoCard.tsx, StatusBadge.tsx
      └─ MenuPath.tsx                 "Configurações › Sistema › …" com pixel-art, rótulos por idioma
```

## Modelo de conteúdo
O EN é a fonte. Os textos de interface ficam em `dictionaries.ts`; o conteúdo longo em MDX por idioma; os metadados são agnósticos de idioma em JSON, com campos `title`/`summary` por idioma.

### `firmware.json`
```jsonc
{
  "latestKnownFirmware": "14.10",           // ≥ isto e sem faixa → página "sem método público"
  "ranges": [
    {
      "id": "7.00-13.60",                    // slug da rota /fw/7.00-13.60
      "min": "7.00", "max": "13.60",         // inclusivo; check-content falha se sobrepor
      "status": "public",                    // public | research | none
      "title": { "en": "…", "es": "…", "pt": "…" },
      "entryPoints": ["webkit"],             // webkit | bdj-disc | youtube-app | game-save | …
      "needs": ["usb", "pc-or-phone-same-network"],
      "persistent": false,                   // re-executar após cada reboot?
      "repos": ["ntfargo/Relapse-Exploit", "etaHEN/etaHEN", "ps5-payload-dev/elfldr"],
      "claims": [{ "text": "support", "evidence": "proven", "source": "relapse-readme" }],
      "reviewedAt": "2026-10-29"
    },
    { "id": "14.00-14.10", "min": "14.00", "max": "14.10", "status": "none",
      "repos": [], "trackerUrl": "https://ps5-jb-tracker.vercel.app",
      "claims": [
        { "text": "prolapse-announced", "evidence": "reported", "source": "…" },
        { "text": "gezine-private-demo-1410", "evidence": "reported", "source": "…" }
      ] }
  ]
}
```

### `repos.json`
Editado à mão; só humanos mudam `status`.
```jsonc
{
  "repos": [
    {
      "id": "ntfargo/Relapse-Exploit",       // = full_name esperado; verify falha se mudar
      "category": "exploit",                 // exploit | hen | loader | homebrew | utility | backup | research
      "firmware": [{ "min": "7.00", "max": "13.60",
                     "evidence": "proven", "source": "relapse-readme" }],
      "status": "listed",                    // listed | review | excluded
      "reviewedBy": "rohbatista18-sys", "reviewedAt": "2026-10-29",
      "notes": "Original. m2k7m/Relapse-Exploit é clone → excluded."
    }
  ]
}
```
`repos.snapshot.json` é gerado: `{ checkedAt, repos: { [id]: { full_name, archived, fork, pushed_at, stargazers_count, license, created_at, latestRelease:{tag,published_at} } } }`.

### `guides.json` / `errors.json`
```jsonc
{ "slug": "install-pkg", "menu": "packages",          // packages | apps | payloads | transfer | backup | emulators
  "requires": { "ranges": ["7.00-13.60"], "hen": true },
  "repos": ["etaHEN/etaHEN"], "title": {…}, "summary": {…}, "reviewedAt": "…" }

{ "slug": "kernel-panic", "severity": "medium",        // low | medium | high (high = risco de perder dados)
  "symptoms": { "en": ["Console turned off by itself…"], "pt": […], "es": […] },
  "stopIf": { "en": "…" }, "sources": ["sony-safe-mode"], "reviewedAt": "…" }
```

### Componentes MDX (contrato)
- `<Claim evidence="proven|reported" src="sourceId">texto</Claim>`: o selo ✓ COMPROVADO / ~ RELATADO com link para a fonte. Sem `src`, o build falha.
- `<Repo id="owner/name" />`: o `RepoCard` vem do snapshot e só renderiza se o repo estiver `listed`; caso contrário, o build falha.
- `<Step n={1} title="…">`, `<Warn kind="ban|brick|update">`, `<MenuPath path={["settings","system","systemSoftware","consoleInfo"]} />`. O `MenuPath` busca os rótulos oficiais em cada idioma no dicionário.

## Navegação
```
Header:  [△○✕□ PS5 JB GUIDE]   Firmware ▾   Guias ▾   Erros   Riscos   [EN|ES|PT]
         Firmware ▾ → "Como descobrir minha versão" (modal) + lista de faixas com StatusBadge
         Guias ▾    → Pacotes · Apps & homebrew · Payloads · Transferência (FTP) · Backup · Emuladores
RiskStrip (todas as páginas): Fique offline · Não atualize · Doação não compra jailbreak  [saiba mais → /riscos]

/{lang}            Home: "Qual é o seu firmware?" [ 9.60 ] [IR]  ·  (Como descobrir?)  ·  grade de faixas
/{lang}/fw/{id}    StatusBadge → Antes de começar (Checklist) → Você vai precisar → Passos → Funcionou? →
                   Depois de reiniciar → Repos verificados (RepoCard) → Erros comuns desta faixa → Fontes
/{lang}/fw/14.00-14.10  status none: "Ainda não há jailbreak público" + relatados + "não atualize" + [ver tracker]
/{lang}/guias      grade de cards → /guias/{slug}
/{lang}/erros      lista filtrável por sintoma (busca client-side no índice) → /erros/{slug}
/{lang}/riscos     página completa · /{lang}/sobre (também em modal no rodapé)
```
O modal "Como descobrir" usa o `<dialog>` nativo do tracker. Como o Cache Components mantém a rota montada em `<Activity>`, o modal fecha ao navegar (`onClose` + fechar no `pathname` change). Docs: `02-guides/preserving-ui-state.md`.

## Como manter a lista de repos verificada
1. **Entrada:** um repo novo entra em `repos.json` com `status: "review"`. O site ignora repos em `review`.
2. **Verificação automática** (`npm run verify:repos`, com `GITHUB_TOKEN` opcional local ou o secret da Action):
   - `GET /repos/{id}`: 404 → erro; `full_name ≠ id` → erro (rename ou transferência, que é golpe comum); `archived` → aviso.
   - `GET /repos/{id}/releases?per_page=3`: assets `.exe`/`.msi`/`.scr`/`.bat` → marca `flags: ["windows-binary"]`.
   - Heurísticas de golpe (FR-024): conta nova (`GET /users/{owner}.created_at` < 90 dias), repo novo, fork de repo listado, nome que imita projeto listado, README com "free games", "download games", "donate to unlock", link de Discord/Telegram para "liberar".
   - A saída é o `repos.snapshot.json` e um relatório `verify-report.md`.
3. **Revisão humana:** o mantenedor lê o README e as releases. Se ok, preenche `status: "listed"`, `reviewedBy`, `reviewedAt` e a fonte da faixa de firmware.
4. **Action semanal** (`cron: 0 9 * * 1` + `workflow_dispatch`): roda o verify e abre um PR "repos: snapshot AAAA-MM-DD" com o relatório no corpo.
   - Ela **nunca** faz merge; o deploy só acontece depois do merge aprovado.
   - Usa só o `GITHUB_TOKEN` da própria Action, com permissões `contents: write, pull-requests: write`.
5. **No site:** cada `RepoCard` mostra "verificado em DD/MM" e "último push". Snapshot com mais de 14 dias → aviso "verificação antiga".

### Seed inicial verificado em 2026-10-29
Fonte: `gh api` (detalhes nas notas da sessão `repos-verified-2026-10-29.md`). A faixa de firmware só está preenchida onde uma fonte primária foi lida; o resto fica para a T030.

| Repo | Categoria | Faixa (fonte) | Status proposto |
|---|---|---|---|
| ntfargo/Relapse-Exploit | exploit | 7.00–13.60 (README, comprovado) | listed |
| etaHEN/etaHEN | hen | a confirmar no README | review → listed |
| EchoStretch/kstuff | hen | a confirmar (é fork; checar upstream) | review |
| ps5-payload-dev/elfldr · ftpsrv · websrv · sdk | loader/utility | a confirmar | review → listed |
| itsPLK/ps5-webkit-autoloader · ps5-payload-manager | loader | a confirmar | review |
| Gezine/Y2JB · Gezine/BD-JB5 | exploit (YouTube app / disco BD-J) | a confirmar | review |
| idlesauce/umtx2 | exploit | a confirmar (relatado ≤5.50) | review |
| Cryptogenic/PS5-IPV6-Kernel-Exploit | exploit (legado) | ≤4.51 (descrição do autor) | review |
| EchoStretch/ps5-app-dumper | backup | a confirmar | review |
| mihawk-99/PS5_RetroArch | homebrew | a confirmar | review |
| 7 repos de pesquisa 14.10 do tracker | research | só na página 14.x, linkados via tracker | listed (seção "pesquisa") |
| m2k7m/Relapse-Exploit | — | clone do original | **excluded** |
| jordyidk/slopkit | — | proveniência desconhecida, sem licença | **excluded** até revisão |
| saawant12/orbit-store-ps5 (e "Overdrive") | — | noticiados neste mês como lojas de jogos piratas (relatado; anexar URL da notícia) | **excluded** |
| outras lojas / "download managers" (ProsperoStore, RecompStore, ps5upload, pkg-sender) | homebrew | entram só se o catálogo for apenas homebrew (Esclarecimento 1) | **review** |
| executáveis Windows de contas pequenas (PS5-Jailbreak-Doctor etc.) | — | binário não testado | **excluded** |

`Gezine/p2jb` → 404; não citar como repo.

## Faixas de firmware (estado em 2026-10-29)
O seletor e as páginas saem só do `firmware.json`. Seed inicial:

| Faixa | Status | O que sabemos com fonte | Pendente |
|---|---|---|---|
| ≤ 4.51 | public (legado) | IPV6 kernel exploit, descrição do autor | confirmar o fluxo atual recomendado (T030) |
| 4.xx–6.xx restantes | a pesquisar | — | T030: fontes primárias por faixa |
| 7.00–13.60 | public | Relapse, "Supported firmware: 7.00 through 13.60." (README) | HEN/loader recomendado + passos (T031) |
| 14.00–14.10 | none | sem método público; Prolapse anunciado (relatado); demo privado do Gezine no 14.10 (relatado) | fontes das duas notícias (T032) |
| > 14.10 | none | — | regra automática via `latestKnownFirmware` |

A pesquisa de conteúdo (rótulos oficiais da Sony em EN/PT/ES, tabela completa de faixas e erros) está registrada nas notas da sessão e é a entrada da Fase 2. Nada entra no MDX sem passar pela regra de selos.

### Fontes oficiais da Sony já levantadas (seed de `sources.json`)
O agente que fez a pesquisa relatou estas páginas como conferidas; reabrir cada uma na T031 antes de citar.
- **Modo de Segurança:** as 8 opções. "Restaurar PS5" e "Restaurar PS5 (Reinstalar software do sistema)" apagam tudo; reparar armazenamento, restaurar configurações padrão e limpar cache/reconstruir banco de dados mantêm jogos e saves.
  - EN/PT/ES: `playstation.com/{en-us|pt-br|es-es}/support/hardware/safe-mode-playstation/`
- **Atualizar ou reinstalar via USB:** pendrive em FAT32/exFAT, arquivo `PS5/UPDATE/PS5UPDATE.PUP`. A Sony só oferece a versão atual, então reinstalar = ir para o firmware mais recente.
  - `…/support/hardware/ps5/system-software/`
- **Atualização automática:** "Baixar/Instalar arquivos de atualização automaticamente" e o modo repouso "Permanecer conectado à Internet".
  - `…/support/hardware/automatic-updates-playstation/`
- **Console travado / luzes indicadoras:** desligar da tomada, esperar 3 min e só então o Modo de Segurança.
  - `…/support/hardware/ps5-ps4-power-indicator-lights/`
- **Erro `WS-116332-6`:** acesso proibido (ex.: violação dos termos) ou serviço indisponível. Serve de fonte para o aviso de ban, com selo "relatado" quanto à causa.
  - `…/support/error-codes/ps5/ws-116332-6/`

### Limite prático da autoria com IA
Durante a pesquisa, dois agentes foram barrados pelo filtro de segurança da API ao escrever walkthroughs detalhados de exploit e troubleshooting.

Isso reforça a opção (a) do Esclarecimento 2:
- o nosso texto fica no nível do usuário (o que preparar, o que esperar, quando parar);
- o passo a passo técnico é **o README oficial de cada projeto**, linkado no `RepoCard`;
- as Tarefas T030/T033/T034 contam com escrita e revisão do mantenedor, não só com geração por IA.

## Avisos de risco (conteúdo mínimo obrigatório)
- **Ban da PSN:** não fazer login na PSN nem ficar online com o console desbloqueado; usar o console offline ou com DNS bloqueando os servidores da Sony. Selo "relatado" até termos fonte primária.
- **Nunca atualizar:**
  - desligar o download e a instalação automáticos (caminho oficial em cada idioma, com a fonte da Sony);
  - ignorar os prompts de atualização;
  - discos de jogos novos podem trazer atualização;
  - "Reinstalar software do sistema" no Modo de Segurança instala o firmware mais recente.
- **Brick / corrupção:** exploits podem travar o console; nunca desligar da tomada durante escrita; o que cada opção do Modo de Segurança apaga (fonte Sony).
- **Garantia e termos:** desbloquear viola os termos da Sony; a garantia pode ser recusada.
- **Golpes:** ninguém vende jailbreak; doação não compra jailbreak; não baixar ".exe que faz jailbreak".

## Deploy na Vercel
1. Repo local `C:\Users\Admin\Jailbreak Progress\ps5-jb-guide` com git, autor `315827579+rohbatista18-sys@users.noreply.github.com`. O e-mail do trabalho não pode ser usado: ele já bloqueou deploy.
2. **Só com aprovação:** criar o repo **privado** `rohbatista18-sys/ps5-jb-guide` e fazer o push.
   - A Action semanal consome minutos do plano grátis de repos privados (~1 min/semana, longe do limite).
3. **Só com aprovação:** `vercel link` para o projeto novo `ps5-jb-guide` → `ps5-jb-guide.vercel.app`.
   - Não há env vars de runtime. O `GITHUB_TOKEN` existe só na Action.
   - Desligar Web Analytics, Speed Insights e Log Drains (`SECURITY.md` do tracker).
   - Não há `vercel.json` de cron; a verificação roda na Action.
4. Preview deploys nos PRs; produção só no merge para `main`.
5. **Pós-deploy:** checar o redirect `/` → idioma, `hreflang`, sitemap, a ausência de requisições de terceiros (Network) e o Lighthouse.

## Segurança e privacidade
- Mesmos headers e CSP do tracker (`next.config.ts`). `connect-src 'self'` e `img-src 'self' data:`: os avatares do GitHub **não** são carregados; o card usa só texto.
- O conteúdo do GitHub (descrições) é tratado como texto e nunca como HTML/MDX; só campos numéricos e datas do snapshot entram na página.
- O único cookie é `lang`. Não há armazenamento no servidor.
- Links externos com `rel="noopener noreferrer"`.

## Constituição
Ver `.specify/memory/constitution.md` do guia, que herda do tracker segredos, degradação graciosa, precisão, leveza e simplicidade. Princípios novos:
- **VI Privacidade**
- **VII Só fonte verificada**
- **VIII Sem pirataria**
- **IX Publicação só com aprovação**
