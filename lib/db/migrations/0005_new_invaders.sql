ALTER TABLE "transacoes_financeiras" ALTER COLUMN "categoria" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."transacao_categoria";--> statement-breakpoint
CREATE TYPE "public"."transacao_categoria" AS ENUM('pagamento_pedido', 'compra_insumo', 'compra_diversa', 'outro');--> statement-breakpoint
ALTER TABLE "transacoes_financeiras" ALTER COLUMN "categoria" SET DATA TYPE "public"."transacao_categoria" USING "categoria"::"public"."transacao_categoria";--> statement-breakpoint
ALTER TABLE "pedido_pagamentos" DROP COLUMN "tipo";--> statement-breakpoint
DROP TYPE "public"."pagamento_tipo";