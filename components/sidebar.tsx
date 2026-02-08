"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { Home, Package, ShoppingCart, BarChart3, Brain, ChefHat, FileText, Settings, ChevronRight } from "lucide-react"
import { useEffect } from "react"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Predictions", href: "/predictions", icon: Brain },
  { name: "Kitchen", href: "/kitchen", icon: ChefHat },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { ingredients } = useAppStore()

  const lowStockCount = ingredients.filter((ing) => ing.quantityToday <= ing.minThreshold).length

  useEffect(() => {
    const prefetchRoutes = () => {
      navigation.forEach((item) => {
        if (item.href !== pathname) {
          router.prefetch(item.href)
        }
      })
    }

    if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(prefetchRoutes)
      return () => window.cancelIdleCallback(idleId)
    }

    const timeoutId = setTimeout(prefetchRoutes, 300)
    return () => clearTimeout(timeoutId)
  }, [pathname, router])

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border transition-colors">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">RestaurantOS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-sidebar-primary/15 text-sidebar-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <div className="flex items-center gap-4">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>

                {/* Notifications */}
                {item.name === "Inventory" && lowStockCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {lowStockCount}
                  </Badge>
                )}

                {isActive && <ChevronRight className="w-4 h-4" />}
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
