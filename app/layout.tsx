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
  title: "World Cup Predictor",
  description:
    "Pick winners. Score points. Climb the leaderboard.",

  openGraph: {
    title: "World Cup Predictor",
    description:
      "Pick winners. Score points. Climb the leaderboard.",
    images: ["/World-Cup-Trophy.png"],
  },

  twitter: {
    card: "summary_large_image",
    title: "World Cup Predictor",
    description:
      "Pick winners. Score points. Climb the leaderboard.",
    images: ["/World-Cup-Trophy.png"],
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
