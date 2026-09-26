"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import * as z from "zod";
import { db } from "@/lib/db";
import { clientes } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";

const ClienteSchema = z.object({
  nome: z.string().trim().min(1, { error: "Digite um nome." }),
  telefoneWhatsapp: z.string().trim().min(1, { error: "Digite o WhatsApp." }),
  enderecoEntrega: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
});

export type ClienteState = { error: string } | undefined;

function parseForm(formData: FormData) {
  return ClienteSchema.safeParse({
    nome: formData.get("nome"),
    telefoneWhatsapp: formData.get("telefoneWhatsapp"),
    enderecoEntrega: formData.get("enderecoEntrega") || undefined,
    observacoes: formData.get("observacoes") || undefined,
  });
}

export async function createCliente(
  _state: ClienteState,
  formData: FormData,
): Promise<ClienteState> {
  await requireUser();
  const validated = parseForm(formData);
  if (!validated.success) {
    return { error: "Confira os campos destacados." };
  }

  await db.insert(clientes).values(validated.data);
  redirect("/clientes");
}

export async function updateCliente(
  clienteId: string,
  _state: ClienteState,
  formData: FormData,
): Promise<ClienteState> {
  await requireUser();
  const validated = parseForm(formData);
  if (!validated.success) {
    return { error: "Confira os campos destacados." };
  }

  await db.update(clientes).set(validated.data).where(eq(clientes.id, clienteId));
  redirect("/clientes");
}

export async function deleteCliente(clienteId: string): Promise<{ error?: string }> {
  await requireUser();

  try {
    await db.delete(clientes).where(eq(clientes.id, clienteId));
  } catch {
    return { error: "Não dá pra apagar: esse cliente já tem pedido registrado." };
  }
  return {};
}
