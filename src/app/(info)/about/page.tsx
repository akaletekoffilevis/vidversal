import type { Metadata } from "next";
import { AboutSection } from "@/components/info/InfoPages";

export const metadata: Metadata = {
  title: "À propos — Vidversal",
};

export default function AboutPage() {
  return <AboutSection />;
}