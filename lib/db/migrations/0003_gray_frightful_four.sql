ALTER TABLE "pedido_itens" DROP CONSTRAINT "pedido_itens_pedido_id_pedidos_id_fk";
--> statement-breakpoint
ALTER TABLE "pedido_pagamentos" DROP CONSTRAINT "pedido_pagamentos_pedido_id_pedidos_id_fk";
--> statement-breakpoint
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido_pagamentos" ADD CONSTRAINT "pedido_pagamentos_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;