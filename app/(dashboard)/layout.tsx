import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <div className="relative z-10 flex h-full min-h-screen w-full">
        <AppSidebar />
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-black/60 backdrop-blur-md border-l border-white/5 outline-none relative z-10">
          <div className="h-full relative z-10 flex flex-col items-center justify-center">
             {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
