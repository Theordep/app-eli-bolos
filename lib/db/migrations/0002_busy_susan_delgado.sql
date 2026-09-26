ALTER TABLE "produto_custo_snapshot" DROP CONSTRAINT "produto_custo_snapshot_produto_id_produtos_id_fk";
--> statement-breakpoint
ALTER TABLE "receita_itens" DROP CONSTRAINT "receita_itens_produto_id_produtos_id_fk";
--> statement-breakpoint
ALTER TABLE "produto_custo_snapshot" ADD CONSTRAINT "produto_custo_snapshot_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receita_itens" ADD CONSTRAINT "receita_itens_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;