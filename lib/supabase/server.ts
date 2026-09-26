import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cria um client novo a cada chamada — nunca compartilhar entre requests (Server Components/Actions).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado de um Server Component (sem permissão de escrever cookie).
            // Tudo bem: o proxy.ts é quem garante a sessão atualizada nesse caso.
          }
        },
      },
    },
  );
}
