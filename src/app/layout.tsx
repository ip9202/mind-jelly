import type { Metadata } from "next";
import { Dongle, Gowun_Dodum, Gamja_Flower, Plus_Jakarta_Sans } from "next/font/google";
import BridgeInitializer from "@/components/bridge/BridgeInitializer";
import { ThemeInitializer } from "@/components/ui/ThemeInitializer";
import "./globals.css";

const dongle = Dongle({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-dongle",
  display: "swap",
});

const gowun = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gowun",
  display: "swap",
});

const gamja = Gamja_Flower({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gamja",
  display: "swap",
});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
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
    <html lang="ko" className={`${jakartaSans.variable} ${dongle.variable} ${gowun.variable} ${gamja.variable} h-full antialiased`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* FOUC 방지: React hydration 전에 localStorage에서 테마를 읽어 dark 클래스 적용 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mind-jelly-theme');if(t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <BridgeInitializer />
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
