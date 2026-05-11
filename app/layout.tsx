import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "buildapps.fun — fun apps by Rowan and Mae",
  description: "Fun apps built by two kids who want to make life better.",
};

export const viewport: Viewport = {
  themeColor: "#ffd166",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
