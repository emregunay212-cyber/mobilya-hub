import "./globals.css";
import { Playfair_Display, DM_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "WebKoda - Web Sitesi Üretim Platformu",
  description: "İşletmeniz için profesyonel web sitesi oluşturun",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366F1" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
