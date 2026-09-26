import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Confere a sessão direto no servidor, dentro da própria Server Action — não depende só do
 * proxy.ts. Se o matcher do proxy um dia parar de cobrir uma rota por engano, as actions
 * continuam protegidas. Ver node_modules/next/dist/docs/.../guides/authentication.md
 * ("Server Actions ... verify if the user is allowed to perform a mutation").
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autorizado.");
  }

  return user;
}
