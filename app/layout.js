import "./globals.css";
import { Playfair_Display, DM_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "WebKoda - Web Sitesi Üretim Platformu",
  description: "İşletmeniz için profesyonel web sitesi oluşturun",
};

export const viewport = {
  themeColor: "#6366F1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="dns-prefetch" href="https://xoqwwlkglnzrnjrcpryz.supabase.co" />
        <link rel="preconnect" href="https://xoqwwlkglnzrnjrcpryz.supabase.co" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
