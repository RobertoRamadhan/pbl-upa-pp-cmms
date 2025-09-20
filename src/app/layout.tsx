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

export const metadata = {
  title: "CMMS - Perawatan & Perbaikan",
  description: "Sistem Manajemen Pemeliharaan Terkomputerisasi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body 
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen`}
        style={{
          backgroundImage: 'url("/bg.js.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="min-h-screen bg-white/35 backdrop-blur-sm">
          {children}
        </div>
      </body>
    </html>
  );
}