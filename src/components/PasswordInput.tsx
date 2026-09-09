"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
}

export function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
  required,
}: PasswordInputProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? t("common.hidePassword") : t("common.showPassword")}
        title={visible ? t("common.hidePassword") : t("common.showPassword")}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}