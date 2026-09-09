import { Header } from "@/components/Header";
import { DownloadForm } from "@/components/DownloadForm";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center w-full pt-32 pb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2 tracking-tight">
          Téléchargez <span className="text-brand-600 dark:text-brand-400">n&apos;importe quelle</span> vidéo
        </h1>
        <p className="text-muted-foreground text-center text-sm sm:text-base mb-8 max-w-md">
          Collez un lien et téléchargez en quelques secondes.
          <br />
          Toutes les plateformes, toutes les qualités.
        </p>

        <DownloadForm />
        <Features />
      </main>

      <Footer />
    </div>
  );
}
