ALTER TABLE "insumo_historico_precos" DROP CONSTRAINT "insumo_historico_precos_insumo_id_insumos_id_fk";
--> statement-breakpoint
ALTER TABLE "insumo_historico_precos" ADD CONSTRAINT "insumo_historico_precos_insumo_id_insumos_id_fk" FOREIGN KEY ("insumo_id") REFERENCES "public"."insumos"("id") ON DELETE cascade ON UPDATE no action;