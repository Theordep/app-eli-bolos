import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O indicador de rota do modo dev (bolinha "N") fica no canto inferior-esquerdo por padrão
  // e sua área de toque invisível intercepta cliques ali — atrapalhava o menu "Mais" no celular.
  // Só existe em desenvolvimento; não tem efeito nenhum no app publicado.
  devIndicators: false,
};

export default nextConfig;
