import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "bouture.com — Échange de boutures entre voisins",
    short_name: "Bouture",
    description:
      "Découvrez et partagez des boutures de plantes près de chez vous",
    start_url: "/carte",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#4A6741",
    background_color: "#F5F0E8",
    categories: ["lifestyle", "social"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
