import React from "react";
import { useLang } from "@/lib/LanguageContext";
import { LANGUAGES } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LanguageSelector() {
  const { lang, changeLang, t } = useLang();
  const current = LANGUAGES.find(l => l.code === lang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs px-2"
          aria-label={t.language}
          title={t.language}
        >
          <Globe className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">{current?.flag} {current?.label}</span>
          <span className="sm:hidden">{current?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {LANGUAGES.map(l => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => changeLang(l.code)}
            className={`text-xs gap-2 cursor-pointer ${lang === l.code ? "font-semibold" : ""}`}
          >
            <span>{l.flag}</span>
            <span>{l.label}</span>
            {lang === l.code && <span className="ml-auto text-[10px] text-muted-foreground">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}