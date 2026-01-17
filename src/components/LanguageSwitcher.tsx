"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useState } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale(); // Hazırkı dil (az, en, ru)
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);

  // Dili dəyişən funksiya
  const changeLanguage = (newLocale: string) => {
    setIsPending(true);
    router.replace(pathname, { locale: newLocale });
    setIsPending(false);
  };

  return (
    <div className="flex items-center gap-2 bg-dark-800 p-1 rounded-lg border border-dark-700">
      {["az", "en", "ru"].map((lang) => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          disabled={isPending}
          className={`
            px-3 py-1 text-sm font-medium rounded-md transition-all uppercase
            ${locale === lang 
              ? "bg-primary text-white shadow-lg shadow-red-900/20" 
              : "text-gray-400 hover:text-white hover:bg-dark-700"}
          `}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}