import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600", "700"], variable: "--font-noto-sans" });

export const metadata: Metadata = {
  title: "PeytOtoria",
  description: "Мессенджер нового поколения",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${notoSans.variable} bg-background`}>
      <body className={notoSans.className}>{children}</body>
    </html>
  );
}
