import { pgTable, text } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_helpers";

export const clientes = pgTable("clientes", {
  id: id(),
  nome: text("nome").notNull(),
  telefoneWhatsapp: text("telefone_whatsapp"),
  enderecoEntrega: text("endereco_entrega"),
  observacoes: text("observacoes"),
  ...timestamps,
});
