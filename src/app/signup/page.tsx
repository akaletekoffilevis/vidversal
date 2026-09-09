"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Lock, Loader2, User, MailCheck, RefreshCw } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Une erreur est survenue.");
      return;
    }
    if (data.needVerification) {
      setPendingEmail(email.trim());
      return;
    }
    router.push("/?account=1");
  };

  const resendVerification = async () => {
    if (!pendingEmail) return;
    setResending(true);
    setError(null);
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail }),
    });
    setResending(false);
    const data = await res.json();
    setError(data.error || null);
  };

  if (pendingEmail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center">
            <MailCheck className="w-10 h-10 text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-xl font-bold mb-2">Vérifiez votre email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Un lien d&apos;activation a été envoyé à{" "}
            <strong className="text-foreground">{pendingEmail}</strong>.
            <br />
            Cliquez dessus pour activer votre compte, puis connectez-vous.
          </p>
          <button
            onClick={resendVerification}
            disabled={resending}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
            Renvoyer l&apos;email
          </button>
          {error && <p className="text-xs text-destructive mt-3">{error}</p>}
          <Link
            href="/login"
            className="block text-xs text-brand-600 dark:text-brand-400 hover:underline mt-4"
          >
            J&apos;ai vérifié, me connecter →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-1">
          Vid<span className="text-brand-600 dark:text-brand-400">versal</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Créez votre compte gratuit
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative">
            <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="relative">
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe (min. 8 caractères)"
              minLength={8}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            S&apos;inscrire
          </button>
        </form>

        <p className="text-[10px] text-muted-foreground text-center mt-4">
          Gratuit pour toujours. L&apos;abonnement Premium est optionnel.
        </p>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Déjà un compte?{" "}
          <Link href="/login" className="text-brand-600 dark:text-brand-400 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}