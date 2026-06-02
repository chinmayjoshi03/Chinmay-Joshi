import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chinmay Joshi · Portfolio",
  description: "Chinmay Joshi — software engineer building mobile apps, real-time systems and AI products. Guided by Raikō, a sleepy thunder swordsman.",
};

export const viewport: Viewport = {
  themeColor: "#0c0b09",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="is-intro">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=JetBrains+Mono:wght@400;700&family=Zen+Kaku+Gothic+New:wght@400;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
