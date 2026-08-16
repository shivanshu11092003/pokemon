import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { themeInitScript } from "@/hooks/use-theme";
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

export default function RootLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* Applies the stored theme before first paint — no flash of the wrong theme. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, self-authored bootstrap */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-ink"
        >
          Skip to results
        </a>

        <Providers>
          <AppHeader />
          {children}
          {modal}
          <SiteFooter />
        </Providers>
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
