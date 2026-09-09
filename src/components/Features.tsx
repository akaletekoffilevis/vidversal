"use client";

import {
  Download,
  Music,
  MonitorPlay,
  Layers,
  Shield,
  Zap,
  Globe,
  ListVideo,
  Scissors,
  CloudUpload,
  Smartphone,
  Clock,
  Languages,
  FileImage,
  BarChart3,
  Sparkles,
  Lock,
  Star,
  Headphones,
  Gauge,
} from "lucide-react";

const features = [
  { icon: Download, title: "Toutes plateformes", desc: "YouTube, TikTok, Instagram, X, Facebook, Twitch, Vimeo...", free: true },
  { icon: MonitorPlay, title: "Qualité HD/4K/8K", desc: "Choisissez la résolution exacte de votre téléchargement", free: false },
  { icon: Music, title: "Extraction audio MP3", desc: "Extrayez l'audio en MP3, FLAC ou WAV haute fidélité", free: false },
  { icon: Layers, title: "Multi-format", desc: "MP4, WebM, MKV, AVI, MOV, GIF animé...", free: false },
  { icon: ListVideo, title: "Playlists & chaînes", desc: "Téléchargez une playlist ou une chaîne entière d'un clic", free: false },
  { icon: Languages, title: "Sous-titres traduits", desc: "Extraction et traduction automatique des sous-titres", free: false },
  { icon: Scissors, title: "Couper / Recadrer", desc: "Éditez la vidéo avant de télécharger", free: false },
  { icon: CloudUpload, title: "Upload cloud", desc: "Envoyez directement sur Drive, Dropbox ou iCloud", free: false },
  { icon: FileImage, title: "Création de GIF", desc: "Transformez une séquence en GIF animé partageable", free: false },
  { icon: Sparkles, title: "Résumé IA", desc: "Résumé automatique du contenu vidéo par intelligence artificielle", free: false },
  { icon: Headphones, title: "Transcription Whisper", desc: "Audio → texte avec sous-titres automatiques", free: false },
  { icon: Shield, title: "Scan anti-virus", desc: "Vérification automatique de la sécurité des fichiers", free: false },
  { icon: Zap, title: "Vitesse prioritaire", desc: "Serveurs dédiés pour les téléchargements rapides", free: false },
  { icon: Globe, title: "API développeurs", desc: "Intégrez Vidversal dans vos propres applications", free: false },
  { icon: Smartphone, title: "PWA mobile", desc: "Application installable sur téléphone, téléchargements hors-ligne", free: false },
  { icon: Clock, title: "Téléchargements programmés", desc: "Planifiez un téléchargement automatique à l'avance", free: false },
  { icon: BarChart3, title: "Historique & stats", desc: "Suivez tous vos téléchargements avec des statistiques", free: true },
  { icon: Lock, title: "Vidéos privées", desc: "Téléchargez des vidéos privées avec autorisation", free: false },
  { icon: Gauge, title: "Compression intelligente", desc: "Réduisez la taille sans perdre en qualité", free: false },
  { icon: Star, title: "Sans publicité", desc: "Expérience premium 100% propre sans interruption", free: false },
];

export function Features() {
  return (
    <section id="features" className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-16 sm:mt-20 mb-16">
      <h2 className="text-center text-2xl sm:text-3xl font-bold mb-2 px-4">
        Fonctionnalités
      </h2>
      <p className="text-center text-muted-foreground text-sm mb-8 sm:mb-10 px-4">
        Ce que Vidversal peut faire pour vous
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group relative p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all"
          >
            <f.icon className="w-5 h-5 text-brand-600 dark:text-brand-400 mb-2" />
            <h3 className="text-[13px] sm:text-sm font-semibold mb-0.5 leading-snug">
              {f.title}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {f.desc}
            </p>
            {!f.free && (
              <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-warning/20 text-warning font-medium">
                PRO
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}