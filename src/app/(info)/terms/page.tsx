import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CalendarClock } from "lucide-react";

export const metadata = {
  title: "Conditions d'utilisation — Vidversal",
};

export default function TermsPage() {
  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>
      <h1 className="text-3xl font-bold mb-2">Conditions d&apos;utilisation</h1>
      <p className="text-sm text-muted-foreground mb-8 flex items-center gap-1.5">
        <CalendarClock className="w-3.5 h-3.5" /> Dernière mise à jour : septembre 2026
      </p>

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">1. Acceptation des conditions</h2>
          <p>
            En utilisant Vidversal, vous acceptez les présentes conditions d&apos;utilisation.
            Si vous n&apos;êtes pas d&apos;accord, veuillez ne pas utiliser le service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">2. Usage personnel uniquement</h2>
          <p>
            Vidversal est un outil à usage personnel. Vous vous engagez à télécharger
            uniquement du contenu pour lequel vous disposez des droits, ou pour un usage
            personnel conforme aux lois applicables en matière de droit d&apos;auteur.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">3. Respect des droits d&apos;auteur</h2>
          <p>
            Vous êtes seul responsable des contenus que vous téléchargez. Vidversal ne
            contourne pas les systèmes de protection (DRM) et vous invite à respecter
            les droits des créateurs et des plateformes.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">4. Compte & abonnements</h2>
          <p>
            Le compte est personnel et non cessible. L&apos;abonnement PRO est prépayé,
            non remboursable, et peut être résilié à tout moment depuis votre espace
            Admin. Les fonctionnalités PRO sont accessibles tant que l&apos;abonnement est actif.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">5. Limitation de responsabilité</h2>
          <p>
            Vidversal est fourni « tel quel », sans garantie. Nous ne sommes pas
            responsables des dommages directs ou indirects liés à l&apos;utilisation
            du service ou des fichiers téléchargés.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">6. Interdictions</h2>
          <p>
            Il est interdit d&apos;utiliser Vidversal pour : télécharger du contenu à des fins
            commerciales sans autorisation, contourner des DRM, violer les conditions
            d&apos;utilisation des plateformes tierces, ou toute utilisation illégale.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">7. Contact légal</h2>
          <p>
            Pour toute question juridique :{" "}
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