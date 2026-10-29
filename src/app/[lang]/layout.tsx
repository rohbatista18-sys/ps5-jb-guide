import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Atkinson_Hyperlegible, Press_Start_2P, VT323 } from "next/font/google";
import Dialog from "@/components/Dialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PixelCrowd from "@/components/PixelCrowd";
import PsButtons from "@/components/PsButtons";
import RiskStrip from "@/components/RiskStrip";
import SiteMenu from "@/components/SiteMenu";
import { INTL_TAG, LOCALES, OG_LOCALE, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { GUIDE_MENUS, getRanges } from "@/lib/content";
import { COMMUNITY_URL, REPO_URL, SITE_URL, SUPPORT_URL, TRACKER_URL } from "@/lib/site";
import styles from "./layout.module.css";
import "../globals.css";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-pixel",
  display: "swap",
});

// Reading font for all body text (globals.css: --font-text). Pixel fonts stay for headings/buttons.
const body = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

// Short decorative numbers only (globals.css: --font-retro), e.g. the online counter HUD.
const retro = VT323({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-vt323",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { title, description } = getDictionary(lang).meta;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: title,
    alternates: {
      canonical: `/${lang}`,
      languages: { ...Object.fromEntries(LOCALES.map((l) => [INTL_TAG[l], `/${l}`])), "x-default": "/" },
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[lang],
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
      url: `/${lang}`,
      siteName: title,
      title,
      description,
    },
    twitter: { card: "summary", title, description },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b0b14",
  colorScheme: "dark",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { default: About } = await import(`@content/${lang}/about.mdx`);

  return (
    <html lang={INTL_TAG[lang]} data-scroll-behavior="smooth" className={`${pixel.variable} ${body.variable} ${retro.variable}`}>
      <body>
        <PixelCrowd
          onlineLabel={dict.presence.online}
          youLabel={dict.presence.you}
          visitsLabel={dict.presence.visits}
          visitsShortLabel={dict.presence.visitsShort}
        />
        <div className={styles.shell}>
          <a href="#main" className={`px-btn ${styles.skip}`}>
            {dict.header.skip}
          </a>
          <header className={styles.header}>
            <a href={`/${lang}`} className={styles.brand} aria-label={`${dict.meta.title} · ${dict.header.home}`}>
              <PsButtons className={styles.symbols} />
              <span className={styles.title}>{dict.meta.title}</span>
            </a>
            <p className={styles.tagline}>{dict.header.tagline}</p>
            <SiteMenu
              lang={lang}
              labels={dict.nav}
              ranges={getRanges().map((r) => ({ id: r.id, title: r.title[lang], status: r.status }))}
              guideMenus={GUIDE_MENUS}
            />
            <LanguageSwitcher current={lang} label={dict.header.language} />
            {/* Fixed top-right on screen; last in the header so keyboard users meet the menu first. */}
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-btn ${styles.support}`}
              title={dict.header.supportSiteHint}
            >
              <span aria-hidden="true">♥ </span>
              {dict.header.supportSite}
              <span className="sr-only">
                {" "}
                — {dict.header.supportSiteHint} {dict.header.newTab}
              </span>
            </a>
          </header>
          <RiskStrip lang={lang} labels={dict.riskStrip} />

          <main id="main" tabIndex={-1} className={styles.main}>
            {children}
          </main>

          <footer className={styles.footer}>
            <div className={styles.notice} role="note" aria-label={dict.footer.noticeLabel}>
              <p className={styles.warning}>{dict.footer.donationWarning}</p>
              <p>{dict.footer.disclaimer}</p>
              <p>{dict.footer.nonprofit}</p>
              <p>{dict.footer.privacy}</p>
            </div>
            <div className={styles.footerActions}>
              <Dialog label={dict.footer.about} closeLabel={dict.footer.close} titleId="about-title">
                <article className={`px-box ${styles.prose}`}>
                  <About />
                </article>
              </Dialog>
              <a href={`${TRACKER_URL}/${lang}`} className={styles.footerLink} target="_blank" rel="noopener noreferrer">
                {dict.footer.tracker} ↗
              </a>
              <a href={COMMUNITY_URL} className={styles.footerLink} target="_blank" rel="noopener noreferrer">
                {dict.footer.community} ↗
              </a>
              <a href={REPO_URL} className={styles.footerLink} target="_blank" rel="noopener noreferrer">
                {dict.footer.sourceCode} ↗
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
