import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PlannerProvider } from "@/components/planner-provider";

export const metadata: Metadata = {
  title: "DublinSaver — Make your money last longer",
  description:
    "Turn your remaining Dublin budget into a practical dinner and transport plan.",
  applicationName: "DublinSaver",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "DublinSaver",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#216448",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PlannerProvider>{children}</PlannerProvider>
      </body>
    </html>
  );
}
