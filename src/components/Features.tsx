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
import { useI18n } from "@/lib/i18n";

const features = [
  { icon: Download, free: true },
  { icon: MonitorPlay, free: false },
  { icon: Music, free: false },
  { icon: Layers, free: false },
  { icon: ListVideo, free: false },
  { icon: Languages, free: false },
  { icon: Scissors, free: false },
  { icon: CloudUpload, free: false },
  { icon: FileImage, free: false },
  { icon: Sparkles, free: false },
  { icon: Headphones, free: false },
  { icon: Shield, free: false },
  { icon: Zap, free: false },
  { icon: Globe, free: false },
  { icon: Smartphone, free: false },
  { icon: Clock, free: false },
  { icon: BarChart3, free: true },
  { icon: Lock, free: false },
  { icon: Gauge, free: false },
  { icon: Star, free: false },
];

export function Features() {
  const { t } = useI18n();
  return (
    <section id="features" className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-16 sm:mt-20 mb-16">
      <h2 className="text-center text-2xl sm:text-3xl font-bold mb-2 px-4">
        {t("features.title")}
      </h2>
      <p className="text-center text-muted-foreground text-sm mb-8 sm:mb-10 px-4">
        {t("features.subtitle")}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {features.map((f, i) => (
          <div
            key={i}
            className="group relative p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all"
          >
            <f.icon className="w-5 h-5 text-brand-600 dark:text-brand-400 mb-2" />
            <h3 className="text-[13px] sm:text-sm font-semibold mb-0.5 leading-snug">
              {t(`features.items.${i}.name`)}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t(`features.items.${i}.desc`)}
            </p>
            {!f.free && (
              <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-warning/20 text-warning font-medium">
                {t("common.pro")}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}