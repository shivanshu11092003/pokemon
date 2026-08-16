import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { parseTheme, THEME_COOKIE, themeClass } from "@/lib/theme";
import { cn } from "@/lib/utils/cn";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Pokédex Explorer",
    template: "%s · Pokédex Explorer",
  },
  description:
    "Search, filter and compare all 1,025 Pokémon. A fast, accessible Pokédex built on PokéAPI.",
  applicationName: "Pokédex Explorer",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#131318" },
  ],
};

export default async function RootLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  // Reading the preference here is the whole trick: the theme class ships in the
  // server HTML, so the client hydrates markup that is already correct.
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      className={cn(
        themeClass(theme),
        geistSans.variable,
        geistMono.variable,
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
            {modal}
            <SiteFooter />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line py-8">
      <div className="mx-auto max-w-[100rem] px-4 text-center text-xs text-ink-faint sm:px-6 lg:px-10">
        Data from{" "}
        <a
          href="https://pokeapi.co"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-ink-muted underline underline-offset-2 hover:text-ink"
        >
          PokéAPI
        </a>
        . Pokémon and Pokémon character names are trademarks of Nintendo.
      </div>
    </footer>
  );
}
