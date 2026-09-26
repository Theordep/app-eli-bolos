import { getConfiguracaoAtual } from "@/lib/db/queries/configuracoes";
import { ConfiguracoesForm } from "@/components/configuracoes/configuracoes-form";

export default async function ConfiguracoesPage() {
  const atual = await getConfiguracaoAtual();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 font-heading text-xl font-semibold text-foreground">
        Configurações
      </h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Isso define como o app calcula o custo e o preço sugerido de cada produto.
      </p>

      <ConfiguracoesForm
        defaultValues={
          atual
            ? {
                metaSalarioMensalCentavos: String(
                  (atual.metaSalarioMensalCentavos / 100).toFixed(2),
                ).replace(".", ","),
                horasTrabalhoMes: atual.horasTrabalhoMes,
                taxaPerdaPercentual: atual.taxaPerdaPercentual,
                custoInvisivelPercentual: atual.custoInvisivelPercentual,
                margemLucroPadraoPercentual: atual.margemLucroPadraoPercentual,
              }
            : {
                metaSalarioMensalCentavos: "",
                horasTrabalhoMes: "160",
                taxaPerdaPercentual: "10",
                custoInvisivelPercentual: "15",
                margemLucroPadraoPercentual: "25",
              }
        }
      />
    </div>
  );
}
