import { Navbar } from "@/components/Navbar"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-7xl mx-auto relative z-10 pt-24">
        {children}
      </div>
    </>
  )
}
