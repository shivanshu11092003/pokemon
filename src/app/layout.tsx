import type { Metadata, Viewport } from "next";
import { Fredoka, Geist_Mono, Manrope } from "next/font/google";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { CompareTray } from "@/features/compare/compare-tray";
import { parseTheme, THEME_COOKIE, themeClass } from "@/lib/theme";
import { cn } from "@/lib/utils/cn";
import "./globals.css";
import { Providers } from "./providers";

// The pairing: Fredoka carries the one playful headline moment, Manrope carries
// everything data-dense. Its rounded terminals echo Fredoka without competing,
// and it stays crisp at stat-number and search-placeholder sizes.
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Fan-made replica of the hand-drawn logo lettering (free for personal and
// commercial use). Confined to the header wordmark — the brand moment.
const pokemonSolid = localFont({
  src: "./fonts/pokemon-solid.ttf",
  variable: "--font-pokemon",
  display: "swap",
});
const pokemonHollow = localFont({
  src: "./fonts/pokemon-hollow.ttf",
  variable: "--font-pokemon-hollow",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pokémon Explorer",
    template: "%s · Pokémon Explorer",
  },
  description:
    "Search, filter and compare all 1,025 Pokémon. A fast, accessible Pokédex built on PokéAPI.",
  applicationName: "Pokémon Explorer",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.ico" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#131318" },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Reading the preference here is the whole trick: the theme class ships in the
  // server HTML, so the client hydrates markup that is already correct.
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      className={cn(
        themeClass(theme),
        manrope.variable,
        fredoka.variable,
        geistMono.variable,
        pokemonSolid.variable,
        pokemonHollow.variable,
        "h-full antialiased",
      )}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-ink"
        >
          Skip to results
        </a>

        <ThemeProvider initialTheme={theme}>
          <Providers>
            <AppHeader />
            {children}
            <CompareTray />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
