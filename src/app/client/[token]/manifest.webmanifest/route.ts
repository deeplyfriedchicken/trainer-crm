export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  return Response.json(
    {
      name: "My Trainer",
      short_name: "My Trainer",
      description: "Your personal training portal",
      start_url: `/client/${token}`,
      scope: "/client/",
      display: "standalone",
      orientation: "portrait",
      theme_color: "#fd6dbb",
      background_color: "#070712",
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    {
      headers: { "Content-Type": "application/manifest+json" },
    },
  );
}
