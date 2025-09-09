import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { Notifications } from "@/components/ui/Notifications";

// 強制動態渲染所有頁面
// 這避免了靜態生成時的錯誤
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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
        style={{
          fontFamily: 'var(--font-system)',
          minHeight: '100vh',
          transition: 'all 0.3s ease',
          background: 'var(--background)'
        }}
      >
        <ThemeProvider>
          {children}
          <Notifications />
        </ThemeProvider>
      </body>
    </html>
  );
}
