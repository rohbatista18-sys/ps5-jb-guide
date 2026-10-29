# Spec 001 — PS5 JB Guide (guia para iniciantes)

**Status:** Esclarecimentos resolvidos, aguardando aprovação final · **Criado:** 2026-10-29 · **Irmão de:** `ps5-jb-tracker`

## Visão
Um site curto e honesto que leva um iniciante do zero até o jailbreak do **próprio** PS5:
1. aprender a ver a versão de firmware no console;
2. escolher a versão;
3. ler o tutorial daquela faixa, com a lista de repositórios **verificados** daquela faixa.

Em volta disso ficam um menu de guias (pacotes, apps, homebrew, payloads, FTP, backup dos
próprios jogos), uma central de erros comuns e uma página de riscos.

A identidade visual é a mesma do tracker: retrô 8-bit/CRT, `.px-btn`/`.px-box`, Press Start 2P + VT323 e os símbolos PS em SVG.
O site está em EN/ES/PT, não tem fins lucrativos e não rastreia ninguém.

## Limites de conteúdo (confirmados — ver Esclarecimentos)
- **Ensina:** jailbreak do próprio console, homebrew, payloads, transferência de arquivos e backup/dump dos **próprios** jogos e saves.
- **Não ensina e não linka:** como obter jogos pirateados, sites de PKG/ISO, "lojas" ou "download managers" cujo catálogo aponte para jogos de terceiros, nem cheats online.
- **Só lista repositórios** que passaram na verificação da API do GitHub e na revisão humana (FR-020 a FR-025).
  - Nunca entram sites "jailbreak grátis", executáveis não testados, clones de projetos conhecidos ou páginas que pedem doação em troca do jailbreak.
- **Nunca afirma que algo funciona sem fonte.** Toda afirmação técnica leva um selo:
  - **Comprovado:** fonte primária, como o README ou as release notes do próprio projeto, ou o suporte oficial da Sony.
  - **Relatado:** notícia, fórum ou vídeo.
  - **Sem fonte:** não pode ser publicado.
- **Doações:** o aviso do tracker se repete aqui. Doações apoiam os devs e **não compram jailbreak**; quem vende jailbreak é golpista.

## Histórias de usuário
- **US1 (P1) — Descobrir a versão:** Como iniciante, na primeira tela vejo "Qual é o seu firmware?" e um botão "Como descobrir?".
  - O botão abre um modal com o passo a passo no console (Configurações > Sistema > Software do sistema > ...), com os rótulos do menu no meu idioma e uma ilustração em pixel art do menu, não um print da Sony.
- **US2 (P1) — Escolher a versão:** Digito a versão (ex.: `9.60`) ou toco numa faixa da lista e vou para a página daquela faixa.
  - Uma versão inválida mostra um erro simples. Uma versão mais nova que a última conhecida cai na página "sem jailbreak público".
- **US3 (P1) — Tutorial da faixa:** Na página da faixa vejo, nesta ordem:
  1. status (público / só pesquisa / nenhum);
  2. o checklist "antes de começar" (offline, não atualizar, backup de saves);
  3. o que preciso (USB, PC, disco etc.);
  4. os passos numerados, cada passo com selo de evidência;
  5. "como saber se funcionou";
  6. "depois de reiniciar";
  7. os repos verificados daquela faixa.
- **US4 (P1) — Faixa sem jailbreak público:** Se meu firmware é 14.00/14.10 (hoje), vejo uma página honesta:
  - não existe método público;
  - o que foi anunciado (Prolapse) e o que foi demonstrado em privado (demo do Gezine no 14.10), cada item com selo "relatado" e fonte;
  - o que **não** fazer: não atualizar, desconfiar de quem vende ou pede doação;
  - um link para o tracker, para acompanhar o progresso.
- **US5 (P1) — Riscos:** Antes de qualquer tutorial vejo os riscos: ban da PSN, brick/corrupção, nunca atualizar o firmware e como atualizações acidentais acontecem, e perda de garantia.
  - Os riscos também têm uma página própria.
- **US6 (P2) — Menu de guias:** Num menu simples ("Guias ▾") acho: instalar pacotes (.pkg), apps e homebrew, enviar payloads, FTP/transferência, backup dos meus jogos e saves, emuladores.
  - Cada guia diz o pré-requisito (faixa e HEN) e linka os repos verificados.
- **US7 (P2) — Erros comuns:** Numa central de erros acho meu sintoma pela descrição:
  - o exploit falhou ou deu "sem memória";
  - o console congelou;
  - kernel panic / reiniciou sozinho;
  - o payload não carrega;
  - corrupção do software do sistema ou do banco de dados (Modo de Segurança);
  - atualização acidental;
  - o pkg não instala;
  - erro de login na PSN.

  Cada erro traz causa provável, passos para resolver e **quando parar** (por exemplo, "Reinstalar software do sistema" no Modo de Segurança atualiza para o firmware mais recente e acaba com o jailbreak).
- **US8 (P2) — Idioma:** Vejo tudo em EN/ES/PT com o mesmo seletor e a mesma detecção do tracker.
  - Se um texto ainda não foi traduzido, vejo a versão em inglês com um aviso.
- **US9 (P3) — Atualidade:** Em cada página vejo a "última revisão" (data) e, nos repos, o último push e as estrelas da última verificação.

## Requisitos funcionais
### Navegação e páginas
- **FR-001:** Rotas: `/{lang}` (início e seletor), `/{lang}/fw/{faixa}` (tutorial), `/{lang}/guias`, `/{lang}/guias/{slug}`, `/{lang}/erros`, `/{lang}/erros/{slug}` e `/{lang}/riscos`.
  - `/{lang}/sobre` (sem fins lucrativos, privacidade, como verificamos) **e** um modal com o mesmo texto, aberto pelo rodapé.
- **FR-002:** O cabeçalho tem um menu fixo e curto: `Firmware ▾ | Guias ▾ | Erros | Riscos | idioma`. Os menus suspensos são acessíveis por teclado e viram um único menu no celular (≤639 px).
- **FR-003:** A página inicial cabe em uma tela no desktop: título, seletor de firmware, botão "Como descobrir?" (modal), faixa de riscos e atalhos para Guias e Erros. Conteúdo longo vai para modais e páginas próprias.
- **FR-004:** O seletor aceita `X.YY` (ex.: `9.6` → `9.60`) e mapeia a versão para uma faixa pelo `firmware.json`. Versões fora de qualquer faixa conhecida vão para a página "sem método público".
- **FR-005:** Cada tutorial começa com um bloco de riscos e o checklist "antes de começar". O checklist é client-side, sem persistência no servidor.
- **FR-006:** Todo passo, guia e erro mostra a data da "última revisão" e as fontes. Afirmações técnicas usam `<Claim level="proven|reported" src="…">`.

### Conteúdo
- **FR-010:** O conteúdo fica em arquivos versionados no repo, e nada vem de um CMS ou banco. Os arquivos estão descritos em `plan.md › Modelo de conteúdo`:
  - `content/firmware.json`
  - `content/repos.json`
  - `content/guides.json`
  - `content/errors.json`
  - os textos MDX por idioma em `content/{lang}/…`
- **FR-011:** O build falha se:
  - um MDX referencia um repo inexistente ou não "listed";
  - uma faixa não tem tutorial em EN;
  - uma `Claim` não tem `src`;
  - uma faixa de firmware se sobrepõe a outra.
- **FR-012:** Tradução: EN é a fonte. ES e PT podem faltar temporariamente e caem para EN com aviso ("Tradução pendente").

### Repos verificados
- **FR-020:** Um repo só aparece no site se em `repos.json` tiver `status: "listed"`, `reviewedBy` e `reviewedAt` preenchidos, e um snapshot recente em `repos.snapshot.json`.
- **FR-021:** O script `npm run verify:repos` consulta `GET /repos/{owner}/{repo}` e `/releases?per_page=1` para cada repo e grava o snapshot (full_name, archived, fork, pushed_at, stars, licença, última release).
  - Ele **falha** se algum repo der 404, se o `full_name` mudar (rename ou transferência) ou se o repo virar arquivado sem que o JSON diga isso.
- **FR-022:** O build usa **só** o snapshot e não acessa a rede. Um repo sem snapshot não renderiza.
- **FR-023:** Uma GitHub Action semanal roda o `verify:repos` e abre um **PR** com o diff do snapshot. Ela nunca faz merge nem deploy sozinha.
- **FR-024:** Critérios de exclusão automática que mandam o repo para revisão:
  - criado há menos de 30 dias;
  - menos de 5 estrelas;
  - fork de outro repo da lista (clone);
  - release com `.exe` ou `.msi`;
  - README com "download games", "free games" ou pedido de doação "para liberar".

  A revisão é humana e o motivo fica registrado em `repos.json`.
- **FR-025:** A faixa de firmware de cada repo cita a fonte (linha do README ou da release) e tem `evidence: proven|reported`.

### Riscos e honestidade
- **FR-030:** Uma faixa de risco persistente (curta) aparece em todas as páginas: "Fique offline · Não atualize · Doação não compra jailbreak".
- **FR-031:** `/{lang}/riscos` cobre:
  - ban da PSN (não logar online com o console desbloqueado);
  - como evitar atualização (desligar a atualização automática, ignorar prompts, cuidado com discos de jogos novos, DNS);
  - brick e corrupção;
  - Modo de Segurança e o que cada opção apaga;
  - garantia.
- **FR-032:** A página da faixa sem método público nunca usa "em breve" nem datas. Ela só repete o que tem fonte e linka o tracker (`https://ps5-jb-tracker.vercel.app/{lang}`).

### Não funcionais
- **FR-040:** Nada de analytics, cookies além de `lang`, terceiros no navegador (fontes self-hosted) ou contadores. Usa o mesmo CSP do tracker.
- **FR-041:** Acessibilidade AA: foco visível amarelo, `prefers-reduced-motion`, funciona em 360 px e menus por teclado.
- **FR-042:** Todas as páginas são pré-renderizadas no build (`generateStaticParams` em `[lang]`, `[faixa]`, `[slug]`). Params desconhecidos dão `notFound()`.

## Fora do escopo
- Hospedar, espelhar ou embutir exploits e payloads: só linkamos o repo oficial.
- Fórum, comentários, contas, login, reações, presença e contador de visitas.
- Qualquer instrução sobre jogos de terceiros, sites de PKG ou cheats online.
- Prints da interface da Sony: usamos ilustração própria em pixel art.
- Automação que publica sem aprovação.

## Critérios de sucesso
- Um iniciante vai da home ao tutorial certo em ≤3 cliques e sabe a versão do console sem sair do site.
- 100% dos repos visíveis têm snapshot de ≤14 dias e revisão humana registrada.
- 100% das afirmações técnicas têm selo e fonte (o build quebra se faltar).
- LCP < 1,5 s e < 100 KB de JS na primeira carga (o site é estático).
- Nenhuma requisição de terceiros no navegador, verificada pela aba Network.

## Esclarecimentos (resolvidos pelo usuário em 2026-10-29)
1. **Limites de conteúdo:** confirmados como escritos acima.
   - **Lojas de homebrew entram após revisão:** só se o catálogo for apenas homebrew e o README não citar jogos de terceiros, com o motivo registrado em `repos.json`.
   - Lojas noticiadas como pirataria (orbit-store, "Overdrive") ficam `excluded`.
2. **Profundidade do tutorial:** passos próprios simplificados no nível do usuário **+** o README oficial como passo a passo técnico.
3. **Nome e domínio:** `ps5-jb-guide.vercel.app`, com o projeto Vercel `ps5-jb-guide`.
4. **Repo:** **privado**, `rohbatista18-sys/ps5-jb-guide`, criado só com aprovação. A Vercel faz deploy de repo privado normalmente.
5. **Link cruzado:** sim. O botão "Guia para iniciantes" no tracker e o link de volta no guia entram **depois** do deploy do guia, como tarefa separada no repo do tracker.
6. **Conteúdo "relatado":** aparece com o selo "~ RELATADO" e a fonte, separado do que é comprovado.
