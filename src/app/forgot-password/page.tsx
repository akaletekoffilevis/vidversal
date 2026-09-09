"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, MailCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSent(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error === "Email invalide." ? t("forgotPassword.errorEmail") : t("forgotPassword.errorGeneric"));
      return;
    }
    setSent(email.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> {t("common.back")}
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-bold mb-1">
          Vid<span className="text-brand-600 dark:text-brand-400">versal</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-6">{t("forgotPassword.title")}</p>

        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center">
              <MailCheck className="w-10 h-10 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-lg font-bold mb-2">{t("forgotPassword.sentTitle")}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t("forgotPassword.sentBody", { email: sent })}
            </p>
            <Link
              href="/login"
              className="block text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              {t("forgotPassword.backLogin")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("forgotPassword.email")}
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
              {t("forgotPassword.submit")}
            </button>

            <Link
              href="/login"
              className="block text-center text-xs text-muted-foreground hover:text-foreground"
            >
              {t("forgotPassword.backLogin")}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}