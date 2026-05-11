import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prank Lab — kind pranks for kids",
  description: "Funny, friendly pranks that make everyone laugh.",
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
