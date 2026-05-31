import { Geist_Mono, Roboto } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip"
import LetterGlitch from "@/components/LetterGlitch"
import { Toaster } from "@/components/ui/sonner"

const roboto = Roboto({ weight: ['400', '500', '700', '900'], subsets: ['latin'], variable: '--font-sans', preload: false })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  preload: false,
})

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SentinelZone",
  description: "SOC Analyst Dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", roboto.variable)}
    >
      <head>
        <meta name="darkreader-lock" />
      </head>
      <body suppressHydrationWarning={true}>
        <ThemeProvider>
          <TooltipProvider>
            <div className="relative min-h-screen bg-black overflow-hidden flex flex-col">
              {/* Background Layer: Z-0 — LetterGlitch animation
                  data-glitch-layer promotes the canvas to its own GPU layer (globals.css) */}
              <div className="fixed inset-0 z-0 pointer-events-none" data-glitch-layer>
                <LetterGlitch glitchSpeed={80} centerVignette={true} outerVignette={false} smooth={true} />
              </div>

              {/* Dark overlay: improves text contrast over the glitch — ui-hacker-production
                  Set to 88% opacity so individual cards don't need their own backdrop-blur,
                  keeping GPU compositing layers to a minimum (performance-optimizer). */}
              <div className="fixed inset-0 z-[1] bg-black/88 pointer-events-none" />

              {/* Foreground Layer: Z-10 */}
              <div className="relative z-10 flex-1 flex flex-col">
                {children}
              </div>
            </div>
              {/* Global Sonner Toast — mounted outside layout div so it is always on top */}
            <Toaster
              theme="dark"
              position="top-right"
              toastOptions={{
                classNames: {
                  toast: "font-mono bg-black/90 border border-white/10 backdrop-blur-xl text-white",
                  title: "text-white text-sm",
                  description: "text-white/60 text-xs",
                  success: "border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
                  error: "border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]",
                }
              }}
            />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
