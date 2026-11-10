import type { Metadata, Viewport } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import FilmProvider from "@/components/FilmProvider";
import "./globals.css";

const display = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-archivo" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Meridian · Seat View",
  description: "Pick your cinema seat and see the view from it.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${inter.variable}`}>
      <body className="font-sans font-medium">
        <FilmProvider>{children}</FilmProvider>
      </body>
    </html>
  );
}