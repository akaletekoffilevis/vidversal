import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-32 pb-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}