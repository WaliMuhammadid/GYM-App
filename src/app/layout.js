import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata = {
  title: "BEAST-FIT AI",
  description: "High-Performance Gym System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={`${inter.variable} ${montserrat.variable} bg-black text-white antialiased w-full min-h-screen overflow-x-hidden`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
