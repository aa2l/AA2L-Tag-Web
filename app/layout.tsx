import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AA2L学社展台",
  description: "AI 绘画图片画廊",
};

// app/layout.tsx

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* 主题色 */}
        <meta name="theme-color" content="#F472B6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* 原有主题脚本 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const systemTheme = prefersDark ? 'dark' : 'light';
                  document.documentElement.setAttribute('data-theme', systemTheme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}