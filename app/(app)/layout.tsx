import Image from "next/image";
import Link from "next/link";
import { LogOut, Settings, Users } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { logout } from "@/lib/actions/auth";

// Área autenticada e orientada a dados que mudam a cada request (pedidos, insumos, financeiro) —
// nunca deve virar página estática gerada em build time.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header
        className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={32} height={32} aria-hidden />
          <span className="font-heading text-lg font-semibold text-foreground">
            Eli Bolos
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/clientes"
            aria-label="Clientes"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Users className="size-5" aria-hidden />
          </Link>

          <Link
            href="/configuracoes"
            aria-label="Configurações"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Settings className="size-5" aria-hidden />
          </Link>

          <form action={logout}>
            <button
              type="submit"
              aria-label="Sair"
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-5" aria-hidden />
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 px-4 py-5">{children}</main>

      <BottomNav />
    </div>
  );
}
