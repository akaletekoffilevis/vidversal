import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Vidversal — Téléchargez n'importe quelle vidéo",
  description:
    "Téléchargez des vidéos depuis toutes les plateformes (YouTube, Instagram, TikTok, Twitter, Facebook...) en collant simplement le lien. Qualité HD, 4K, audio MP3, conversion de format.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`font-sans antialiased`}>
        <I18nProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}