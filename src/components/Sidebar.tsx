"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Wallet, CheckSquare, Bot, MessageSquare, Settings, Users
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({ companyId }: { companyId: string }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { name: "Panel", href: `/${companyId}`, icon: LayoutDashboard },
    { name: "Finans & Giderler", href: `/${companyId}/finance`, icon: Wallet },
    { name: "Görevler", href: `/${companyId}/tasks`, icon: CheckSquare },
    { name: "AI Ajanları", href: `/${companyId}/agents`, icon: Bot },
    { name: "Mesajlar", href: `/${companyId}/messages`, icon: MessageSquare },
    { name: "Ekip & Ayarlar", href: `/${companyId}/settings`, icon: Settings },
  ];

  return (
    <div className="glass-panel" style={{ width: "250px", height: "calc(100vh - 2rem)", margin: "1rem", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
          T
        </div>
        <Link href="/" style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--text-primary)" }}>Tulumba</Link>
      </div>

      <nav style={{ padding: "1rem 0", flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem", overflowY: "auto" }}>
        {navItems.map((item) => {
          // Exact match for dashboard, prefix match for subpages
          const isActive = item.href === `/${companyId}` 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
            
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.5rem",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: isActive ? "rgba(99, 102, 241, 0.15)" : "transparent",
                borderRight: isActive ? "3px solid var(--accent-primary)" : "3px solid transparent",
                transition: "var(--transition)"
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon size={20} color={isActive ? "var(--accent-primary)" : "currentColor"} />
              <span style={{ fontWeight: isActive ? "500" : "400" }}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "1rem", borderTop: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {user?.email?.[0].toUpperCase() || "U"}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: "0.9rem", fontWeight: "500", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
            {user?.email?.split('@')[0]}
          </div>
          <Link href="/" style={{ fontSize: "0.75rem", color: "var(--accent-primary)" }}>Şirket Değiştir</Link>
        </div>
      </div>
    </div>
  );
}
