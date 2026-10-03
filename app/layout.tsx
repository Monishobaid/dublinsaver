import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DublinSaver — Make your money last longer",
  description: "Turn your remaining Dublin budget into a practical dinner and transport plan.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
