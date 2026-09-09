"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, KeyRound, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PasswordInput } from "@/components/PasswordInput";

const ERROR_MAP: Record<string, string> = {
  "Le mot de passe doit contenir au moins 8 caractères.": "resetPassword.errorPassword",
  "Lien invalide ou expiré.": "resetPassword.errorInvalid",
};

function ResetForm() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const localize = (raw: string): string => {
    const key = ERROR_MAP[raw];
    return key ? t(key) : t("resetPassword.errorGeneric");
  };

  if (!token || !email) {
    return (
      <div className="text-center py-2">
        <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center">
          <KeyRound className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-lg font-bold mb-2">{t("resetPassword.invalidTitle")}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t("resetPassword.invalidBody")}</p>
        <Link
          href="/forgot-password"
          className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
        >
          {t("resetPassword.goForgot")}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-2">
        <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center">
          <ShieldCheck className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-lg font-bold mb-2">{t("resetPassword.doneTitle")}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t("resetPassword.doneBody")}</p>
        <Link
          href="/login"
          className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
        >
          {t("resetPassword.goLogin")}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t("resetPassword.errorMismatch"));
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(localize(data.error || ""));
      return;
    }
    setDone(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("resetPassword.password")}
        autoComplete="new-password"
        minLength={8}
        required
      />
      <PasswordInput
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder={t("resetPassword.confirm")}
        autoComplete="new-password"
        minLength={8}
        required
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {t("resetPassword.submit")}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link
        href="/login"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> {t("common.back")}
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-bold mb-1">
          Vid<span className="text-brand-600 dark:text-brand-400">versal</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-6">{t("resetPassword.title")}</p>

        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}