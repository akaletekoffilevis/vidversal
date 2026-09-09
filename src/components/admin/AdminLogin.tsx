"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Shield, Loader2 } from "lucide-react";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erreur de connexion.");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
          <Shield className="w-6 h-6 text-accent-foreground" />
        </div>
        <h1 className="text-xl font-bold text-center mb-1">Espace administrateur</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Accès réservé au propriétaire de Vidversal.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mot de passe admin"
              autoFocus
              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Vérification...
              </>
            ) : (
              "Accéder à l'administration"
            )}
          </button>
        </form>
      </div>

      <Link
        href="/"
        className="block text-center text-xs text-muted-foreground hover:text-foreground mt-4"
      >
        ← Retour à l&apos;accueil
      </Link>
    </div>
  );
}