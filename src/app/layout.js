import { Orbitron, Inter } from "next/font/google";
import "./globals.css";
import Ticker from "@/components/Ticker";
import Background from "@/components/Background";
import CustomCursor from "@/components/CustomCursor";
import MechHUD from "@/components/MechHUD";
import HackerTerminal from "@/components/HackerTerminal";
import AmbientPlayer from "@/components/AmbientPlayer";
import SuperAdminLink from "@/components/SuperAdminLink";
import GodModeListener from "@/components/GodModeListener";
import BottomAlert from "@/components/BottomAlert";
import HackMinigameListener from "@/components/HackMinigameListener";
import IntroCinematic from "@/components/IntroCinematic";
import CookieBanner from "@/components/CookieBanner";
import TokenInitListener from "@/components/TokenInitListener";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata = {
  title: "RANBHOOMI 2026-27 | Graviton Robotics",
  description: "The ultimate technical robotics fest by Graviton Robotics. Join the battle of metal and minds.",
  keywords: ["Robotics", "Fest", "Graviton", "RANBHOOMI", "Tech Fest", "Robo Soccer", "Hackathon"],
  authors: [{ name: "Graviton Robotics" }],
  openGraph: {
    title: "RANBHOOMI 2026-27 | Graviton Robotics",
    description: "The ultimate technical robotics fest by Graviton Robotics.",
    url: "https://ranbhoomi.tech",
    siteName: "RANBHOOMI 2.0",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "RANBHOOMI 2.0 Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RANBHOOMI 2026-27",
    description: "The ultimate technical robotics fest by Graviton Robotics.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-transparent text-foreground selection:bg-neon-cyan selection:text-black">
        <IntroCinematic />
        <GodModeListener />
        <AmbientPlayer />
        <CustomCursor />
        <HackerTerminal />
        <MechHUD />
        <Background />
        <Ticker />
        <SuperAdminLink />
        <BottomAlert />
        <HackMinigameListener />
        <TokenInitListener />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
