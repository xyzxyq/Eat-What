import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eat_What - 我们的日记",
  description: "每天一条，记录我们的专属时光 💕",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/eat_what_logo.png", type: "image/png", sizes: "192x192" }
    ],
    shortcut: "/favicon.ico",
    apple: "/eat_what_logo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
