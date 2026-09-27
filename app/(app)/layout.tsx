import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { Sidebar } from "@/components/sidebar";
import { SECONDARY_NAV_ITEMS } from "@/lib/nav-items";
import { logout } from "@/lib/actions/auth";

// Área autenticada e orientada a dados que mudam a cada request (pedidos, insumos, financeiro) —
// nunca deve virar página estática gerada em build time.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center gap-2.5 px-4 pb-2 md:hidden"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
        >
          <Image
            src="/logo.png"
            alt=""
            width={36}
            height={36}
            aria-hidden
            className="rounded-full"
          />
          <span className="min-w-0 flex-1 truncate font-heading text-lg font-bold text-foreground">
            Bolos Elisângela
          </span>

          <div className="ml-auto flex items-center gap-1">
            {SECONDARY_NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-[18px]" aria-hidden />
              </Link>
            ))}
            <form action={logout}>
              <button
                type="submit"
                aria-label="Sair"
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LogOut className="size-[18px]" aria-hidden />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-4 pb-4 md:px-12 md:py-9">{children}</main>

        <BottomNav />
      </div>
    </div>
  );
}
