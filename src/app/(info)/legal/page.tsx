import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Mentions légales — Vidversal",
};

export default function LegalPage() {
  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>
      <h1 className="text-3xl font-bold mb-6">Mentions légales</h1>

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Éditeur du site</h2>
          <p>
            Vidversal<br />
            Projet personnel — contact : contact@vidversal.app<br />
            Site hébergé par Vercel Inc., 440 N Barranca Ave, Covina, CA 91723, USA.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Direction de la publication</h2>
          <p>
            La direction de la publication est assurée par le propriétaire du projet
            Vidversal, contactable via la{" "}
            <Link href="/contact" className="text-primary hover:underline">page de contact</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des éléments du site Vidversal (textes, logo, interface,
            dénomination) est protégé par le droit de la propriété intellectuelle.
            Toute reproduction sans autorisation est interdite.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Droit applicable</h2>
          <p>
            Les présentes mentions sont soumises au droit français. En cas de litige,
            et à défaut de résolution amiable, les tribunaux français seront seuls
            compétents.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Technologies tierces</h2>
          <p>
            Vidversal utilise les services de : Vercel (hébergement), Supabase
            (authentification et base de données), Stripe (paiement), et le logiciel
            open-source yt-dlp pour l&apos;extraction de médias.
          </p>
        </section>
      </div>
    </>
  );
}