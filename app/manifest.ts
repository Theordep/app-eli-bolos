import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bolos Elisângela",
    short_name: "Bolos Eli",
    description: "Gestão de encomendas e financeiro da confeitaria Bolos Elisângela.",
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
