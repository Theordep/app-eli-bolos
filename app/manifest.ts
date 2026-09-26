import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eli Bolos",
    short_name: "Eli Bolos",
    description: "Gestão de encomendas e financeiro da confeitaria Eli Bolos.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fdf3ec",
    theme_color: "#fdf3ec",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
