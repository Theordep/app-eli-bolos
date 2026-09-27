"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { NAV_ITEMS, SECONDARY_NAV_ITEMS, type NavItem } from "@/lib/nav-items";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

function NavRow({ href, label, icon: Icon, active }: NavItem & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm hover:bg-secondary",
        active
          ? "bg-secondary font-medium text-secondary-foreground"
          : "font-normal text-muted-foreground",
      )}
    >
      <Icon className="size-[18px]" aria-hidden />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside className="sticky top-0 hidden h-screen w-[250px] shrink-0 flex-col gap-1 border-r border-border bg-card p-3.5 md:flex">
      <div className="flex items-center gap-3 px-1.5 pb-5">
        <Image
          src="/logo.png"
          alt=""
          width={40}
          height={40}
          aria-hidden
          className="shrink-0 rounded-full"
        />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-heading text-base font-bold text-foreground">
            Bolos Elisângela
          </span>
          <span className="text-xs text-muted-foreground">Confeitaria Artesanal</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavRow key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>

      <div className="my-2.5 h-px bg-border" />

      <nav className="flex flex-col gap-1">
        {SECONDARY_NAV_ITEMS.map((item) => (
          <NavRow key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>

      <form action={logout} className="mt-auto">
        <button
          type="submit"
          className="flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-normal text-muted-foreground hover:bg-secondary"
        >
          <LogOut className="size-[18px]" aria-hidden />
          Sair
        </button>
      </form>
    </aside>
  );
}
