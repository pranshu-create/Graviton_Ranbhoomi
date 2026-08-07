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
  description: "The ultimate technical robotics fest by Graviton Robotics.",
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
        {children}
      </body>
    </html>
  );
}
