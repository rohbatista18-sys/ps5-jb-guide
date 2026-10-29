import type { Locale } from "./config";

const en = {
  meta: {
    title: "PS5 JB Guide",
    description:
      "A simple, honest beginner's guide to jailbreaking your own PS5: check your firmware, follow the tutorial for your version and use only verified repositories.",
  },
  header: {
    tagline: "Jailbreak your own PS5, step by step",
    home: "Home",
    language: "Language",
  },
  home: {
    title: "What is your firmware?",
    soon: "The tutorials are still being written and reviewed. Nothing here is a step-by-step guide yet.",
  },
  nav: {
    label: "Main",
    menu: "Menu",
    firmware: "Firmware",
    guides: "Guides",
    errors: "Errors",
    risks: "Risks",
    allFirmware: "All firmware ranges",
    allGuides: "All guides",
    guideMenus: {
      packages: "Packages",
      apps: "Apps & homebrew",
      payloads: "Payloads",
      transfer: "File transfer (FTP)",
      backup: "Backup of your own games",
      emulators: "Emulators",
    },
  },
  riskStrip: {
    label: "Before anything else",
    offline: "Stay offline",
    noUpdate: "Do not update",
    noScam: "Donations never buy a jailbreak",
    more: "Read the risks",
  },
  risks: {
    title: "Risks",
  },
  errors: {
    title: "Common errors",
    intro: "Find your problem by what you see on screen.",
    filter: "Filter by symptom",
    filterPlaceholder: "e.g. freezes",
    empty: "No error has been documented and reviewed yet.",
    noMatch: "Nothing matches \"{query}\".",
    severity: { low: "Low risk", medium: "Medium risk", high: "Risk of data loss" },
  },
  guides: {
    title: "Guides",
    intro: "What you can do after the jailbreak, using only reviewed homebrew and your own games.",
    empty: "No guide reviewed yet.",
  },
  status: {
    public: "Public jailbreak",
    none: "No public jailbreak",
    unknown: "Not documented yet",
    draft: "In preparation",
  },
  evidence: {
    proven: "✓ Proven",
    reported: "~ Reported",
    sourceLabel: "Source: {title}",
  },
  picker: {
    label: "Your system software version",
    placeholder: "e.g. 9.60",
    go: "Go",
    invalid: "Type a version like 9.60 or 13.60.",
    newer:
      "{version} is newer than any firmware this guide knows about ({latest}). There is no public jailbreak for it. Do not update any further.",
    undocumented:
      "This guide does not cover {version} yet. Do not update your console while you wait.",
    open: "Open the page for {range}",
    rangesTitle: "All firmware ranges",
  },
  range: {
    back: "← All firmware",
    draftNotice:
      "This page is being prepared. It is not a step-by-step guide yet, and nothing on it tells you to run anything.",
    noneTitle: "There is no public jailbreak for this firmware yet",
    noneBody:
      "Keep your console on this version and do not update it. Research for these versions is followed on the progress tracker.",
    trackerCta: "Open the progress tracker ↗",
    claimsTitle: "What we know",
    noClaims: "Nothing with a source yet.",
    reposTitle: "Verified repositories",
    noRepos: "No repository for this range has passed human review yet.",
    sourcesTitle: "Sources",
    reviewed: "Last reviewed: {date}",
  },
  repo: {
    verified: "Checked on GitHub: {date}",
    lastPush: "Last push: {date}",
    release: "Latest release: {tag}",
    noRelease: "No releases",
    license: "License: {license}",
    noLicense: "No license",
    stars: "{count} stars",
    open: "Open on GitHub ↗",
    stale: "This check is more than {days} days old. Look at the repository before trusting it.",
  },
  claims: {
    "relapse-support": "The Relapse exploit's README lists firmware 7.00 through 13.60 as supported.",
  } as Record<string, string>,
  footer: {
    noticeLabel: "Important notices",
    disclaimer:
      "Unofficial guide. We host no exploits; we only link to each project's official repository. Jailbreaking can get your console banned from PSN and may void your warranty.",
    donationWarning:
      "Donations only support the devs' work. They do NOT buy the jailbreak, and no dev will ever ask for donations in exchange for it. Anyone who does is a scammer.",
    nonprofit: "This is a non-profit site.",
    privacy: "Privacy: no accounts, analytics or tracking. The only cookie stores your language.",
    about: "About this site",
    close: "Close",
    tracker: "Jailbreak progress tracker",
  },
};

export type Dictionary = typeof en;

const es: Dictionary = {
  meta: {
    title: "PS5 JB Guide",
    description:
      "Una guía simple y honesta para principiantes sobre el jailbreak de tu propia PS5: revisa tu firmware, sigue el tutorial de tu versión y usa solo repositorios verificados.",
  },
  header: {
    tagline: "Jailbreak de tu propia PS5, paso a paso",
    home: "Inicio",
    language: "Idioma",
  },
  home: {
    title: "¿Cuál es tu firmware?",
    soon: "Los tutoriales todavía se están escribiendo y revisando. Nada de aquí es aún una guía paso a paso.",
  },
  nav: {
    label: "Principal",
    menu: "Menú",
    firmware: "Firmware",
    guides: "Guías",
    errors: "Errores",
    risks: "Riesgos",
    allFirmware: "Todas las versiones de firmware",
    allGuides: "Todas las guías",
    guideMenus: {
      packages: "Paquetes",
      apps: "Apps y homebrew",
      payloads: "Payloads",
      transfer: "Transferencia de archivos (FTP)",
      backup: "Copia de tus propios juegos",
      emulators: "Emuladores",
    },
  },
  riskStrip: {
    label: "Antes que nada",
    offline: "Quédate sin conexión",
    noUpdate: "No actualices",
    noScam: "Una donación nunca compra un jailbreak",
    more: "Lee los riesgos",
  },
  risks: {
    title: "Riesgos",
  },
  errors: {
    title: "Errores comunes",
    intro: "Encuentra tu problema por lo que ves en la pantalla.",
    filter: "Filtrar por síntoma",
    filterPlaceholder: "ej.: se congela",
    empty: "Todavía no hay ningún error documentado y revisado.",
    noMatch: "Nada coincide con \"{query}\".",
    severity: { low: "Riesgo bajo", medium: "Riesgo medio", high: "Riesgo de perder datos" },
  },
  guides: {
    title: "Guías",
    intro: "Lo que puedes hacer después del jailbreak, solo con homebrew revisado y tus propios juegos.",
    empty: "Todavía no hay guías revisadas.",
  },
  status: {
    public: "Jailbreak público",
    none: "Sin jailbreak público",
    unknown: "Aún sin documentar",
    draft: "En preparación",
  },
  evidence: {
    proven: "✓ Comprobado",
    reported: "~ Reportado",
    sourceLabel: "Fuente: {title}",
  },
  picker: {
    label: "Tu versión del software del sistema",
    placeholder: "ej.: 9.60",
    go: "Ir",
    invalid: "Escribe una versión como 9.60 o 13.60.",
    newer:
      "{version} es más reciente que cualquier firmware que esta guía conoce ({latest}). No hay jailbreak público para ella. No actualices más.",
    undocumented:
      "Esta guía todavía no cubre la {version}. No actualices la consola mientras esperas.",
    open: "Abrir la página de {range}",
    rangesTitle: "Todas las versiones de firmware",
  },
  range: {
    back: "← Todos los firmwares",
    draftNotice:
      "Esta página está en preparación. Todavía no es una guía paso a paso y nada en ella te dice que ejecutes algo.",
    noneTitle: "Todavía no hay jailbreak público para este firmware",
    noneBody:
      "Mantén la consola en esta versión y no la actualices. La investigación de estas versiones se sigue en el tracker de progreso.",
    trackerCta: "Abrir el tracker de progreso ↗",
    claimsTitle: "Lo que sabemos",
    noClaims: "Todavía nada con fuente.",
    reposTitle: "Repositorios verificados",
    noRepos: "Ningún repositorio de esta versión ha pasado todavía la revisión humana.",
    sourcesTitle: "Fuentes",
    reviewed: "Última revisión: {date}",
  },
  repo: {
    verified: "Verificado en GitHub: {date}",
    lastPush: "Último push: {date}",
    release: "Última release: {tag}",
    noRelease: "Sin releases",
    license: "Licencia: {license}",
    noLicense: "Sin licencia",
    stars: "{count} estrellas",
    open: "Abrir en GitHub ↗",
    stale: "Esta verificación tiene más de {days} días. Revisa el repositorio antes de confiar en él.",
  },
  claims: {
    "relapse-support": "El README del exploit Relapse indica compatibilidad con los firmwares 7.00 a 13.60.",
  },
  footer: {
    noticeLabel: "Avisos importantes",
    disclaimer:
      "Guía no oficial. No alojamos exploits; solo enlazamos al repositorio oficial de cada proyecto. El jailbreak puede hacer que baneen tu consola de PSN y puede anular la garantía.",
    donationWarning:
      "Las donaciones solo apoyan el trabajo de los devs. NO compran el jailbreak, y ningún dev pedirá donaciones a cambio de él. Quien lo haga es un estafador.",
    nonprofit: "Este sitio no tiene fines de lucro.",
    privacy: "Privacidad: sin cuentas, analíticas ni rastreo. La única cookie guarda tu idioma.",
    about: "Sobre este sitio",
    close: "Cerrar",
    tracker: "Tracker del progreso del jailbreak",
  },
};

const pt: Dictionary = {
  meta: {
    title: "PS5 JB Guide",
    description:
      "Um guia simples e honesto para iniciantes sobre o jailbreak do seu próprio PS5: veja o seu firmware, siga o tutorial da sua versão e use só repositórios verificados.",
  },
  header: {
    tagline: "Jailbreak do seu próprio PS5, passo a passo",
    home: "Início",
    language: "Idioma",
  },
  home: {
    title: "Qual é o seu firmware?",
    soon: "Os tutoriais ainda estão sendo escritos e revisados. Nada aqui é um passo a passo ainda.",
  },
  nav: {
    label: "Principal",
    menu: "Menu",
    firmware: "Firmware",
    guides: "Guias",
    errors: "Erros",
    risks: "Riscos",
    allFirmware: "Todas as faixas de firmware",
    allGuides: "Todos os guias",
    guideMenus: {
      packages: "Pacotes",
      apps: "Apps e homebrew",
      payloads: "Payloads",
      transfer: "Transferência de arquivos (FTP)",
      backup: "Backup dos seus próprios jogos",
      emulators: "Emuladores",
    },
  },
  riskStrip: {
    label: "Antes de tudo",
    offline: "Fique offline",
    noUpdate: "Não atualize",
    noScam: "Doação nunca compra jailbreak",
    more: "Leia os riscos",
  },
  risks: {
    title: "Riscos",
  },
  errors: {
    title: "Erros comuns",
    intro: "Encontre o seu problema pelo que aparece na tela.",
    filter: "Filtrar por sintoma",
    filterPlaceholder: "ex.: trava",
    empty: "Nenhum erro foi documentado e revisado ainda.",
    noMatch: "Nada corresponde a \"{query}\".",
    severity: { low: "Risco baixo", medium: "Risco médio", high: "Risco de perder dados" },
  },
  guides: {
    title: "Guias",
    intro: "O que dá para fazer depois do jailbreak, só com homebrew revisado e os seus próprios jogos.",
    empty: "Nenhum guia revisado ainda.",
  },
  status: {
    public: "Jailbreak público",
    none: "Sem jailbreak público",
    unknown: "Ainda não documentado",
    draft: "Em preparação",
  },
  evidence: {
    proven: "✓ Comprovado",
    reported: "~ Relatado",
    sourceLabel: "Fonte: {title}",
  },
  picker: {
    label: "A versão do software do sistema",
    placeholder: "ex.: 9.60",
    go: "Ir",
    invalid: "Digite uma versão como 9.60 ou 13.60.",
    newer:
      "A {version} é mais nova que qualquer firmware que este guia conhece ({latest}). Não existe jailbreak público para ela. Não atualize mais.",
    undocumented:
      "Este guia ainda não cobre a {version}. Não atualize o console enquanto espera.",
    open: "Abrir a página da {range}",
    rangesTitle: "Todas as faixas de firmware",
  },
  range: {
    back: "← Todos os firmwares",
    draftNotice:
      "Esta página está em preparação. Ainda não é um passo a passo, e nada nela pede para você executar algo.",
    noneTitle: "Ainda não existe jailbreak público para este firmware",
    noneBody:
      "Mantenha o console nesta versão e não atualize. A pesquisa destas versões é acompanhada no tracker de progresso.",
    trackerCta: "Abrir o tracker de progresso ↗",
    claimsTitle: "O que sabemos",
    noClaims: "Nada com fonte ainda.",
    reposTitle: "Repositórios verificados",
    noRepos: "Nenhum repositório desta faixa passou pela revisão humana ainda.",
    sourcesTitle: "Fontes",
    reviewed: "Última revisão: {date}",
  },
  repo: {
    verified: "Verificado no GitHub: {date}",
    lastPush: "Último push: {date}",
    release: "Última release: {tag}",
    noRelease: "Sem releases",
    license: "Licença: {license}",
    noLicense: "Sem licença",
    stars: "{count} estrelas",
    open: "Abrir no GitHub ↗",
    stale: "Esta verificação tem mais de {days} dias. Confira o repositório antes de confiar nele.",
  },
  claims: {
    "relapse-support": "O README do exploit Relapse lista os firmwares 7.00 a 13.60 como compatíveis.",
  },
  footer: {
    noticeLabel: "Avisos importantes",
    disclaimer:
      "Guia não oficial. Não hospedamos exploits; só linkamos o repositório oficial de cada projeto. O jailbreak pode fazer a PSN banir o seu console e pode anular a garantia.",
    donationWarning:
      "As doações só apoiam o trabalho dos devs. Elas NÃO compram o jailbreak, e nenhum dev vai pedir doação em troca dele. Quem pedir está aplicando golpe.",
    nonprofit: "Este site não tem fins lucrativos.",
    privacy: "Privacidade: sem contas, analytics ou rastreamento. O único cookie guarda o seu idioma.",
    about: "Sobre este site",
    close: "Fechar",
    tracker: "Tracker do progresso do jailbreak",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, es, pt };

export const getDictionary = (locale: Locale) => dictionaries[locale];

export const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
