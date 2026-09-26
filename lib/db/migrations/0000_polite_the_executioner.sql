CREATE TYPE "public"."forma_pagamento" AS ENUM('pix', 'dinheiro', 'cartao', 'outro');--> statement-breakpoint
CREATE TYPE "public"."insumo_tipo" AS ENUM('ingrediente', 'embalagem');--> statement-breakpoint
CREATE TYPE "public"."lista_compra_status" AS ENUM('rascunho', 'concluida');--> statement-breakpoint
CREATE TYPE "public"."modo_venda" AS ENUM('kg', 'unidade');--> statement-breakpoint
CREATE TYPE "public"."origem_preco" AS ENUM('compra', 'ajuste_manual');--> statement-breakpoint
CREATE TYPE "public"."pagamento_tipo" AS ENUM('sinal', 'saldo', 'outro');--> statement-breakpoint
CREATE TYPE "public"."pedido_status" AS ENUM('orcamento', 'confirmado', 'producao', 'entregue', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."transacao_categoria" AS ENUM('sinal_pedido', 'saldo_pedido', 'compra_insumo', 'compra_diversa', 'outro');--> statement-breakpoint
CREATE TYPE "public"."transacao_tipo" AS ENUM('entrada', 'saida');--> statement-breakpoint
CREATE TYPE "public"."unidade_base" AS ENUM('g', 'ml', 'unidade');--> statement-breakpoint
CREATE TABLE "configuracoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vigente_desde" timestamp with time zone DEFAULT now() NOT NULL,
	"meta_salario_mensal_centavos" integer NOT NULL,
	"horas_trabalho_mes" numeric(6, 2) NOT NULL,
	"taxa_perda_percentual" numeric(5, 2) DEFAULT '10' NOT NULL,
	"custo_invisivel_percentual" numeric(5, 2) DEFAULT '15' NOT NULL,
	"margem_lucro_padrao_percentual" numeric(5, 2) DEFAULT '25' NOT NULL,
	"sinal_minimo_percentual" numeric(5, 2) DEFAULT '50' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insumo_historico_precos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"insumo_id" uuid NOT NULL,
	"preco_centavos" integer NOT NULL,
	"registrado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"origem" "origem_preco" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insumos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"tipo" "insumo_tipo" NOT NULL,
	"unidade_base" "unidade_base" NOT NULL,
	"embalagem_quantidade_base" numeric(12, 3) NOT NULL,
	"embalagem_preco_centavos" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "produto_custo_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produto_id" uuid NOT NULL,
	"configuracao_id" uuid NOT NULL,
	"custo_ingredientes_centavos" integer NOT NULL,
	"custo_perda_centavos" integer NOT NULL,
	"custo_invisivel_centavos" integer NOT NULL,
	"custo_direto_total_centavos" integer NOT NULL,
	"calculado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "produtos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"modo_venda" "modo_venda" NOT NULL,
	"tamanho_lote_padrao" integer,
	"tempo_preparo_estimado_minutos" integer NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receita_itens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produto_id" uuid NOT NULL,
	"insumo_id" uuid NOT NULL,
	"quantidade_utilizada" numeric(12, 3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"telefone_whatsapp" text NOT NULL,
	"endereco_entrega" text,
	"observacoes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pedido_itens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"produto_id" uuid NOT NULL,
	"produto_custo_snapshot_id" uuid NOT NULL,
	"quantidade" numeric(12, 3) NOT NULL,
	"tempo_e_por_unidade" boolean DEFAULT false NOT NULL,
	"tempo_preparo_minutos" integer NOT NULL,
	"custo_ingredientes_centavos" integer NOT NULL,
	"custo_mao_obra_centavos" integer NOT NULL,
	"custo_producao_total_centavos" integer NOT NULL,
	"margem_lucro_centavos" integer NOT NULL,
	"preco_venda_sugerido_centavos" integer NOT NULL,
	"preco_venda_final_centavos" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pedido_pagamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"tipo" "pagamento_tipo" NOT NULL,
	"valor_centavos" integer NOT NULL,
	"forma_pagamento" "forma_pagamento" NOT NULL,
	"data_pagamento" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmado" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"status" "pedido_status" DEFAULT 'orcamento' NOT NULL,
	"data_pedido" date NOT NULL,
	"data_entrega_prevista" date NOT NULL,
	"observacoes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compras_insumos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"insumo_id" uuid,
	"data_compra" date NOT NULL,
	"quantidade_comprada" numeric(12, 3),
	"valor_centavos" integer NOT NULL,
	"observacao" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transacoes_financeiras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "transacao_tipo" NOT NULL,
	"categoria" "transacao_categoria" NOT NULL,
	"valor_centavos" integer NOT NULL,
	"data" date NOT NULL,
	"descricao" text,
	"pedido_pagamento_id" uuid,
	"compra_insumo_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listas_compra" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data_inicio_periodo" date NOT NULL,
	"data_fim_periodo" date NOT NULL,
	"status" "lista_compra_status" DEFAULT 'rascunho' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listas_compra_itens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lista_compra_id" uuid NOT NULL,
	"insumo_id" uuid NOT NULL,
	"quantidade_necessaria" numeric(12, 3) NOT NULL,
	"preco_estimado_centavos" integer NOT NULL,
	"comprado" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "insumo_historico_precos" ADD CONSTRAINT "insumo_historico_precos_insumo_id_insumos_id_fk" FOREIGN KEY ("insumo_id") REFERENCES "public"."insumos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produto_custo_snapshot" ADD CONSTRAINT "produto_custo_snapshot_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produto_custo_snapshot" ADD CONSTRAINT "produto_custo_snapshot_configuracao_id_configuracoes_id_fk" FOREIGN KEY ("configuracao_id") REFERENCES "public"."configuracoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receita_itens" ADD CONSTRAINT "receita_itens_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receita_itens" ADD CONSTRAINT "receita_itens_insumo_id_insumos_id_fk" FOREIGN KEY ("insumo_id") REFERENCES "public"."insumos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_produto_custo_snapshot_id_produto_custo_snapshot_id_fk" FOREIGN KEY ("produto_custo_snapshot_id") REFERENCES "public"."produto_custo_snapshot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido_pagamentos" ADD CONSTRAINT "pedido_pagamentos_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compras_insumos" ADD CONSTRAINT "compras_insumos_insumo_id_insumos_id_fk" FOREIGN KEY ("insumo_id") REFERENCES "public"."insumos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes_financeiras" ADD CONSTRAINT "transacoes_financeiras_pedido_pagamento_id_pedido_pagamentos_id_fk" FOREIGN KEY ("pedido_pagamento_id") REFERENCES "public"."pedido_pagamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes_financeiras" ADD CONSTRAINT "transacoes_financeiras_compra_insumo_id_compras_insumos_id_fk" FOREIGN KEY ("compra_insumo_id") REFERENCES "public"."compras_insumos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listas_compra_itens" ADD CONSTRAINT "listas_compra_itens_lista_compra_id_listas_compra_id_fk" FOREIGN KEY ("lista_compra_id") REFERENCES "public"."listas_compra"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listas_compra_itens" ADD CONSTRAINT "listas_compra_itens_insumo_id_insumos_id_fk" FOREIGN KEY ("insumo_id") REFERENCES "public"."insumos"("id") ON DELETE no action ON UPDATE no action;