"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // TODO: brancher sur l'envoi réel (worker ou service d'e-mail)
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setSent(true);
  };

  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>
      <h1 className="text-3xl font-bold mb-1">Contact</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Une question, un bug, une suggestion ? Écrivez-nous.
      </p>

      {sent ? (
        <div className="rounded-2xl border border-success/30 bg-success/10 p-6 text-center">
          <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
          <p className="font-semibold text-foreground">Message envoyé !</p>
          <p className="text-sm text-muted-foreground mt-1">
            Merci {name}. Nous vous répondrons rapidement sur {email}.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                Votre nom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jean Dupont"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                Votre e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="jean@exemple.fr"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Sujet</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">Choisissez un sujet</option>
              <option value="bug">Signaler un bug</option>
              <option value="feature">Suggestion de fonctionnalité</option>
              <option value="billing">Question sur l&apos;abonnement</option>
              <option value="legal">Demande légale / RGPD</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="Décrivez votre demande..."
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
                <Loader2 className="w-4 h-4 animate-spin" /> Envoi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Envoyer le message
              </>
            )}
          </button>

          <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2">
            <Mail className="w-3.5 h-3.5" />
            Vous pouvez aussi nous écrire : contact@vidversal.app
          </p>
        </form>
      )}
    </>
  );
}