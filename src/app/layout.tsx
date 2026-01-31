import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./pwa.css";
import { Toaster } from "@/components/ui/toaster";
import { NextIntlClientProvider } from 'next-intl';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WakeUp Voter - Political Accountability & Issue Awareness",
  description: "A comprehensive platform for tracking political promises, monitoring public issues, and ensuring government accountability. Stay informed, engaged, and empowered with real-time updates and multilingual support.",
  keywords: ["WakeUp Voter", "political accountability", "issue tracking", "government promises", "citizen engagement", "democracy", "public awareness", "political transparency", "voter education", "वेकअप वोटर", "राजनीतिक जवाबदेही"],
  authors: [{ name: "WakeUp Voter Team" }],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WakeUp Voter",
  },
  openGraph: {
    title: "WakeUp Voter - Political Accountability & Issue Awareness",
    description: "Track political promises, monitor public issues, and ensure government accountability. Stay informed and engaged with real-time updates.",
    url: "https://wakeupvoter.in",
    siteName: "WakeUp Voter",
    type: "website",
    locale: "hi_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "WakeUp Voter - Political Accountability & Issue Awareness",
    description: "Track political promises, monitor public issues, and ensure government accountability.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // For the root layout, we'll use a simple approach without internationalization
  // The actual internationalization will be handled in the page components
  return (
    <html lang="hi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
