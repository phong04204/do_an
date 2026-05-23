import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import QueryProvider from "@/providers/QueryProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GameAcc – Mua bán tài khoản game uy tín",
    template: "%s | GameAcc",
  },
  description:
    "Nền tảng mua bán tài khoản game uy tín số 1 Việt Nam. Giao dịch an toàn với hệ thống Escrow, hỗ trợ 24/7.",
  keywords: ["mua bán tài khoản game", "acc game", "shop acc lol", "shop acc valorant", "free fire"],
  openGraph: {
    title: "GameAcc – Mua bán tài khoản game uy tín",
    description: "Giao dịch an toàn với hệ thống Escrow",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${inter.variable} ${orbitron.variable}`}>
      <body className="antialiased" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
