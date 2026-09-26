ALTER TABLE "listas_compra_itens" DROP CONSTRAINT "listas_compra_itens_lista_compra_id_listas_compra_id_fk";
--> statement-breakpoint
ALTER TABLE "listas_compra_itens" ADD CONSTRAINT "listas_compra_itens_lista_compra_id_listas_compra_id_fk" FOREIGN KEY ("lista_compra_id") REFERENCES "public"."listas_compra"("id") ON DELETE cascade ON UPDATE no action;