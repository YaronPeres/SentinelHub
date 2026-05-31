import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ShieldAlert, Crosshair, Database, PieChart } from "lucide-react"
import { AuditLog } from "@/components/AuditLog"
import { LogoutButton } from "@/components/LogoutButton"

// Menu items utilizing the SOC terminology defined in the ux-copywriter skill.
const items = [
  {
    title: "Command Center",
    url: "/dashboard",
    icon: Crosshair,
  },
  {
    title: "Intel Vault",
    url: "/analytics",
    icon: PieChart,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-white/10 bg-black/40 backdrop-blur-md">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between text-cyan-400 font-mono tracking-wider">
            <span>SentinelZone</span>
            <Link href="/" className="text-xs text-white/50 hover:text-cyan-300 transition-colors flex items-center gap-1">
              &larr; Site
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-white/10 hover:text-cyan-300">
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Activity Feed / Audit Log */}
        <div className="mt-auto px-2 pb-4 flex flex-col gap-4">
          <AuditLog />
          <LogoutButton />
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
