import { Geist, Geist_Mono, Roboto } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip"
import LetterGlitch from "@/components/LetterGlitch"

const roboto = Roboto({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SentinelHub",
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
              {/* Background Layer: Z-0 */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <LetterGlitch glitchSpeed={100} centerVignette={true} outerVignette={false} smooth={true} />
              </div>

              {/* Foreground Layer: Z-10 */}
              <div className="relative z-10 flex-1 flex flex-col">
                {children}
              </div>
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
