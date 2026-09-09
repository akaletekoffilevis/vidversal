import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

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
      <body className={`font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
