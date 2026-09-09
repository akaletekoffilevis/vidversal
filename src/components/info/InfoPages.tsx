"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Rocket,
  Shield,
  Zap,
  Send,
  Loader2,
  Mail,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  CalendarClock,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

function BackButton() {
  const { t } = useI18n();
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
    >
      <ArrowLeft className="w-4 h-4" /> {t("common.back")}
    </Link>
  );
}

function renderWithContactLink(text: string) {
  if (!text.includes("CONTACTLINK")) return text;
  const [before, after] = text.split("CONTACTLINK");
  return (
    <>
      {before}
      <ContactLink />
      {after}
    </>
  );
}

function ContactLink() {
  const { t } = useI18n();
  return (
    <Link href="/contact" className="text-primary hover:underline">
      {t("common.contactPage")}
    </Link>
  );
}

export function AboutSection() {
  const { t } = useI18n();
  return (
    <>
      <BackButton />
      <h1 className="text-3xl font-bold mb-4">{t("about.title")}</h1>

      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Vidversal</span> {t("about.p1")}
        </p>
        <p>{t("about.p2")}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
          {[
            { icon: Zap, key: "fast" },
            { icon: Shield, key: "secure" },
            { icon: Rocket, key: "universal" },
          ].map(({ icon: Icon, key }) => (
            <div key={key} className="rounded-2xl border border-border bg-card p-5">
              <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400 mb-2" />
              <p className="font-semibold text-foreground text-sm">
                {t(`about.${key}`)}
              </p>
              <p className="text-xs mt-1">{t(`about.${key}Desc`)}</p>
            </div>
          ))}
        </div>

        <p>{t("about.p3")}</p>
      </div>
    </>
  );
}

const CONTACT_SUBJECTS: { id: string; key: string }[] = [
  { id: "bug", key: "subjectBug" },
  { id: "feature", key: "subjectFeature" },
  { id: "billing", key: "subjectBilling" },
  { id: "legal", key: "subjectLegal" },
  { id: "other", key: "subjectOther" },
];

function ContactForm() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("contact.errorGeneric"));
        return;
      }
      setSent(true);
    } catch {
      setError(t("contact.errorNetwork"));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/10 p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
        <p className="font-semibold text-foreground">{t("contact.sentTitle")}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t("contact.sentBody", { name, email })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            {t("contact.name")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={t("contact.namePlaceholder")}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            {t("contact.email")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t("contact.emailPlaceholder")}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-foreground mb-1.5 block">
          {t("contact.subject")}
        </label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        >
          <option value="">{t("contact.subjectPlaceholder")}</option>
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>
              {t(`contact.${s.key}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-foreground mb-1.5 block">
          {t("contact.message")}
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          placeholder={t("contact.messagePlaceholder")}
          className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-all"
      >
        {sending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> {t("contact.sending")}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> {t("contact.send")}
          </>
        )}
      </button>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2">
        <Mail className="w-3.5 h-3.5" />
        {t("contact.replyDelay")}
      </p>
    </form>
  );
}

export function ContactSection() {
  const { t } = useI18n();
  return (
    <>
      <BackButton />
      <h1 className="text-3xl font-bold mb-1">{t("contact.title")}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t("contact.subtitle")}</p>
      <ContactForm />
    </>
  );
}

export function FaqSection() {
  const { t } = useI18n();
  return (
    <>
      <BackButton />
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <HelpCircle className="w-6 h-6 text-brand-600 dark:text-brand-400" />
        {t("faq.title")}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">{t("faq.subtitle")}</p>

      <div className="space-y-3">
        {Array.from({ length: 8 }, (_, i) => (
          <details
            key={i}
            className="group rounded-xl border border-border bg-card p-4 open:bg-muted/30"
          >
            <summary className="flex items-center justify-between list-none cursor-pointer text-sm font-medium text-foreground">
              {t(`faq.items.${i}.q`)}
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-3 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t(`faq.items.${i}.a`)}
            </p>
          </details>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mt-8">
        {t("faq.moreQ")}{" "}
        <Link href="/contact" className="text-primary hover:underline">
          {t("faq.contactUs")}
        </Link>
        .
      </p>
    </>
  );
}

export function SectionPage({ kind }: { kind: "terms" | "privacy" | "legal" }) {
  const { t } = useI18n();
  const count = kind === "terms" ? 7 : kind === "privacy" ? 6 : 5;
  const hasBlocks = kind === "legal";
  const title = t(`${kind}.title`);
  const updated = t(`${kind}.updated`);

  return (
    <>
      <BackButton />
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {hasBlocks ? null : (
        <p className="text-sm text-muted-foreground mb-8 flex items-center gap-1.5">
          <CalendarClock className="w-3.5 h-3.5" /> {updated}
        </p>
      )}

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        {Array.from({ length: count }, (_, i) => {
          const heading = t(`${kind}.sections.${i}.h`);
          if (hasBlocks) {
            const blocks = t(`legal.sections.${i}.blocks.0`);
            return (
              <section key={i}>
                <h2 className="text-base font-semibold text-foreground mb-2">
                  {heading}
                </h2>
                <p>{renderWithContactLink(blocks)}</p>
              </section>
            );
          }
          const body = t(`${kind}.sections.${i}.p`);
          return (
            <section key={i}>
              <h2 className="text-base font-semibold text-foreground mb-2">
                {heading}
              </h2>
              <p>{renderWithContactLink(body)}</p>
            </section>
          );
        })}
      </div>
    </>
  );
}