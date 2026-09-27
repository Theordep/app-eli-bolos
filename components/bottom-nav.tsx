"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-10 grid grid-cols-4 border-t border-border bg-card md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-[3px] py-1.5 text-[11px]",
              active ? "font-medium text-primary" : "font-normal text-muted-foreground",
            )}
          >
            <Icon className="size-[22px]" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
