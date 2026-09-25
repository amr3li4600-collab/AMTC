import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AMTC CrewEligible | Academy Management",
  description: "Aviation Academy Management Platform for DGAC CSS and Airline Recruitment.",
};

// Inline script to apply dark class and language before first paint (prevents FOUC)
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('amtc-theme');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      var lang = localStorage.getItem('amtc-lang');
      if (lang === 'fr' || lang === 'en') {
        document.documentElement.lang = lang;
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
