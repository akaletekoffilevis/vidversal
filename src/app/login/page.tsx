"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, Lock, Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { signIn } from "next-auth/react";
import { useI18n } from "@/lib/i18n";

function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needVerification, setNeedVerification] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const v = searchParams.get("verified");
    if (v === "1") {
      setInfo(t("login.verifiedBanner"));
    } else if (v === "invalid" || v === "missing") {
      setError(t("login.verifyInvalid"));
    } else if (v === "error") {
      setError(t("login.verifyError"));
    }
    if (searchParams.get("email") === "1") {
      setInfo(t("login.checkEmailBanner"));
    }
  }, [searchParams, t]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    setNeedVerification(false);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      if (res.error === "email_not_verified") {
        setNeedVerification(true);
        setError(t("login.notVerified"));
      } else {
        setError(t("login.errorCredentials"));
      }
      return;
    }
    router.push("/");
    router.refresh();
  };

  const handleGoogle = async () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_ENABLED) {
      setError(t("login.googleDisabled"));
      return;
    }
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  const resendVerification = async () => {
    if (!email) {
      setError(t("login.resendNeedEmail"));
      return;
    }
    setSending(true);
    setError(null);
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSending(false);
    const data = await res.json();
    setInfo(data.message || t("login.resendOk"));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> {t("common.back")}
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-1">
          Vid<span className="text-brand-600 dark:text-brand-400">versal</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {t("login.title")}
        </p>

        {info && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-success/10 border border-success/30 text-success text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            {info}
          </div>
        )}
        {needVerification && (
          <div className="mb-4 p-3 rounded-xl bg-accent border border-border text-xs text-accent-foreground">
            <p className="mb-2">
              {t("login.verificationSent", { email: email || "…" })}
            </p>
            <button
              onClick={resendVerification}
              disabled={sending}
              className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 hover:underline text-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${sending ? "animate-spin" : ""}`} />
              {t("login.resendEmail")}
            </button>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="relative">
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.email")}
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
              placeholder={t("login.password")}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {error && !needVerification && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("login.submit")}
          </button>
        </form>

        {process.env.NEXT_PUBLIC_GOOGLE_ENABLED && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground uppercase">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full py-2.5 rounded-lg border border-border text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t("login.google")}
            </button>
          </>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          {t("login.noAccount")}{" "}
          <Link href="/signup" className="text-brand-600 dark:text-brand-400 hover:underline">
            {t("login.createAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}