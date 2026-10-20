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
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ranbhoomi.tech";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "RANBHOOMI 2026-27 | Graviton Robotics",
    template: "%s | RANBHOOMI 2.0",
  },
  description: "The ultimate technical robotics fest by Graviton Robotics. Join the battle of metal and minds in Winter 2026.",
  keywords: ["Robotics", "Fest", "Graviton", "RANBHOOMI", "Tech Fest", "Robo Soccer", "Robo Race", "Line Follower", "Robo Sumo", "Hackathon"],
  authors: [{ name: "Graviton Robotics", url: "https://ranbhoomi.tech" }],
  creator: "Graviton Robotics",
  publisher: "Graviton Robotics",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RANBHOOMI 2026-27 | Graviton Robotics",
    description: "The ultimate technical robotics fest by Graviton Robotics. Join the battle of metal and minds.",
    url: baseUrl,
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
    title: "RANBHOOMI 2026-27 | Graviton Robotics",
    description: "The ultimate technical robotics fest by Graviton Robotics.",
    images: ["/opengraph-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": "Graviton Robotics",
      "url": baseUrl,
      "logo": `${baseUrl}/Logo.png`,
      "sameAs": [
        "https://www.instagram.com/team.graviton.robotics"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "gravitonroboticsidr@gmail.com",
        "contactType": "event support"
      }
    },
    {
      "@type": "Event",
      "@id": `${baseUrl}/#event`,
      "name": "RANBHOOMI 2.0 Robotics Fest",
      "description": "National robotics fest organized by Graviton Robotics featuring Robo Soccer, Robo Race, Line Follower, Robo Sumo, and Hackathon.",
      "startDate": "2026-11-20T09:00:00+05:30",
      "endDate": "2026-11-22T18:00:00+05:30",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "SVKM's NMIMS Campus",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Super Corridor Road",
          "addressLocality": "Indore",
          "addressRegion": "Madhya Pradesh",
          "postalCode": "452005",
          "addressCountry": "IN"
        }
      },
      "organizer": {
        "@id": `${baseUrl}/#organization`
      }
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} h-full antialiased dark`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-transparent text-foreground selection:bg-neon-cyan selection:text-black">
        {/* Skip to Content for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:bg-neon-cyan focus:text-black font-mono font-bold"
        >
          Skip to main content
        </a>
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
        <main id="main-content" tabIndex={-1} className="outline-none flex-grow flex flex-col">
          {children}
        </main>
        <CookieBanner />
      </body>
    </html>
  );
}
