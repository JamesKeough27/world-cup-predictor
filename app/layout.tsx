import type { Metadata } from "next";
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
  metadataBase: new URL("https://world-cup-predictor-theta.vercel.app"),

  title: "World Cup Predictor",

  description:
    "Pick winners. Score points. Climb the leaderboard.",

  openGraph: {
    title: "World Cup Predictor",
    description:
      "Pick winners. Score points. Climb the leaderboard.",
    url: "https://world-cup-predictor-theta.vercel.app",
    siteName: "World Cup Predictor",

    images: [
      {
        url: "/World-Cup-Trophy-2.png",
        width: 1200,
        height: 630,
        alt: "World Cup Predictor",
      },
    ],

    locale: "en_GB",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "World Cup Predictor",
    description:
      "Pick winners. Score points. Climb the leaderboard.",
    images: ["/World-Cup-Trophy-2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
