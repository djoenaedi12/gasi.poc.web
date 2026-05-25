import { useEffect, useState } from "react";
import { Check, Moon, Search, Sun } from "lucide-react";

import { useI18n, type SupportedLocale } from "../../lib/i18n";
import { AppNotificationMenu } from "./AppNotificationMenu";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { SidebarTrigger } from "../ui/sidebar";

const languages = [
    { label: "Indonesia", value: "id", flag: "🇮🇩" },
    { label: "English", value: "en", flag: "🇺🇸" },
] satisfies Array<{ label: string; value: SupportedLocale; flag: string }>;

export function AppHeader() {
    const { locale, setLocale, t } = useI18n();
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    const selectedLanguage = languages.find((item) => item.value === locale);

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-white px-4 dark:bg-background">
            <SidebarTrigger />

            <div className="relative w-full max-w-sm md:max-w-md">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder={t("common.search.placeholder")} className="h-9 pl-9" />
            </div>

            <div className="ml-auto flex items-center gap-2">
                <AppNotificationMenu />

                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() =>
                        setTheme((currentTheme) =>
                            currentTheme === "dark" ? "light" : "dark",
                        )
                    }
                >
                    {theme === "dark" ? (
                        <Sun className="size-4" />
                    ) : (
                        <Moon className="size-4" />
                    )}
                    <span className="sr-only">{t("common.theme.toggle")}</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        type="button"
                        className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                        <span className="text-base leading-none" aria-hidden="true">
                            {selectedLanguage?.flag}
                        </span>
                        <span className="hidden sm:inline">
                            {selectedLanguage?.value.toUpperCase()}
                        </span>
                        <span className="sr-only">{t("common.language.select")}</span>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" sideOffset={8} className="w-40">
                        <DropdownMenuGroup>
                            {languages.map((item) => (
                                <DropdownMenuItem
                                    key={item.value}
                                    onClick={() => setLocale(item.value)}
                                >
                                    <span className="text-base leading-none" aria-hidden="true">
                                        {item.flag}
                                    </span>
                                    <span>{t(`common.language.${item.value}`) || item.label}</span>
                                    {locale === item.value ? (
                                        <Check className="ml-auto size-4" />
                                    ) : null}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
