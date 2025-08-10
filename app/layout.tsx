import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from '@clerk/nextjs';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Wind - Your Cloud Coding Companion",
  description: "Wind: Claude Code + VSCode, right in your browser. Zero setup. Work from anywhere—desktop or mobile.",
  openGraph: {
    title: "Wind - Your Cloud Coding Companion",
    description: "Wind: Claude Code + VSCode, right in your browser. Zero setup. Work from anywhere—desktop or mobile.",
    url: "https://wind.app",
    siteName: "Wind",
    images: [
      {
        url: "/api/og", // Update if you have a new OpenGraph image for Wind
        width: 1200,
        height: 630,
        alt: "Wind - Your Cloud Coding Companion",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wind - Your Cloud Coding Companion",
    description: "Wind: Claude Code + VSCode, right in your browser. Zero setup. Work from anywhere—desktop or mobile.",
    images: ["/api/og"], // Update if you have a new Twitter OG image for Wind
  },
  metadataBase: new URL("https://wind.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            defaultTheme="system"
            storageKey="wind-ui-theme"
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
