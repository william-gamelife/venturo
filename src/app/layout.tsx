import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { Notifications } from "@/components/ui/Notifications";
import { DevTools } from "@/components/dev/DevTools";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VENTURO | 智能生活管理平台",
  description: "專業的智能生活管理平台，結合莫蘭迪質感、狼域孤寂、星球科技三種主題風格",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        {/* 開發模式禁用快取 */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            <meta httpEquiv="Pragma" content="no-cache" />
            <meta httpEquiv="Expires" content="0" />
          </>
        )}
      </head>
      <body
        className={`${inter.variable} antialiased min-h-screen transition-colors duration-300`}
      >
        <ThemeProvider>
          {children}
          <Notifications />
          <DevTools />
        </ThemeProvider>
      </body>
    </html>
  );
}
