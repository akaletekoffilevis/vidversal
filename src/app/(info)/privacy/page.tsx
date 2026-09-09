import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";

export const metadata = {
  title: "Politique de confidentialité — Vidversal",
};

export default function PrivacyPage() {
  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>
      <h1 className="text-3xl font-bold mb-2">Politique de confidentialité</h1>
      <p className="text-sm text-muted-foreground mb-8 flex items-center gap-1.5">
        <CalendarClock className="w-3.5 h-3.5" /> Dernière mise à jour : septembre 2026
      </p>

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">1. Données collectées</h2>
          <p>
            Lors de la création d&apos;un compte : votre e-mail et votre nom.
            Lors de l&apos;utilisation : les liens que vous soumettez (uniquement le temps
            du téléchargement, ils ne sont pas stockés) et votre historique de
            téléchargements si vous êtes connecté.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">2. Cookies & stockage local</h2>
          <p>
            Nous utilisons un stockage local (localStorage) uniquement pour votre
            préférence de thème (clair/sombre). Aucun cookie publicitaire à ce jour.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">3. Paiement</h2>
          <p>
            Les paiements sont traités par Stripe. Nous ne stockons jamais vos données
            bancaires. Stripe traite celles-ci conformément à ses propres politiques.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">4. Partage des données</h2>
          <p>
            Nous ne vendons aucune donnée. Vos informations ne sont jamais partagées
            avec des tiers, sauf obligation légale.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">5. Sécurité</h2>
          <p>
            Les données sont hébergées sur des serveurs sécurisés (Supabase) avec
            chiffrement en transit et au repos. L&apos;accès à votre compte est protégé
            par votre mot de passe.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">6. Vos droits</h2>
          <p>
            Conformément au RGPD, vous pouvez demander à consulter, corriger ou
            supprimer vos données à tout moment via la{" "}
            <Link href="/contact" className="text-primary hover:underline">
              page de contact
            </Link>
            .
          </p>
        </section>
      </div>
    </>
  );
}