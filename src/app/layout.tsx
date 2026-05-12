import type { Metadata } from "next";
import { Dongle, Gowun_Dodum, Gamja_Flower, Plus_Jakarta_Sans } from "next/font/google";
import BridgeInitializer from "@/components/bridge/BridgeInitializer";
import { ThemeInitializer } from "@/components/ui/ThemeInitializer";
import "./globals.css";

const dongle = Dongle({
  weight: ["400", "700"],
  variable: "--font-dongle",
  display: "optional",
});

const gowun = Gowun_Dodum({
  weight: "400",
  variable: "--font-gowun",
  display: "optional",
});

const gamja = Gamja_Flower({
  weight: "400",
  variable: "--font-gamja",
  display: "optional",
});

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  display: "optional",
});

export const metadata: Metadata = {
  title: "Mind Jelly - 마음 젤리",
  description: "감정을 먹고 커가는 젤리 친구와 함께하는 마음 챙김 웹 앱",
  keywords: ["마음 챙김", "감정 기록", "젤리", "멘탈 헬스"],
  authors: [{ name: "Mind Jelly Team" }],
  openGraph: {
    title: "Mind Jelly - 마음 젤리",
    description: "감정을 먹고 커가는 젤리 친구와 함께하는 마음 챙김 웹 앱",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${jakartaSans.variable} ${dongle.variable} ${gowun.variable} ${gamja.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Material Symbols: CSS @import 방식으로 로딩 성능 개선 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <a href="#main-content" className="skip-nav">본문으로 바로가기</a>
        <BridgeInitializer />
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
