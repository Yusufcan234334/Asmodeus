"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, Bell, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header({ title = "Panel" }: { title?: string }) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="glass-panel" style={{ 
      margin: "1rem 1rem 1rem 0", 
      padding: "1rem 1.5rem", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center" 
    }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "600" }}>{title}</h1>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          background: "rgba(15, 23, 42, 0.5)", 
          padding: "0.5rem 1rem", 
          borderRadius: "20px",
          border: "1px solid var(--glass-border)"
        }}>
          <Search size={16} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Ara..." 
            style={{ 
              background: "none", 
              border: "none", 
              color: "white", 
              outline: "none", 
              marginLeft: "0.5rem",
              width: "150px"
            }} 
          />
        </div>

        <button style={{ 
          width: "40px", 
          height: "40px", 
          borderRadius: "50%", 
          background: "rgba(255, 255, 255, 0.05)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          border: "1px solid var(--glass-border)"
        }}>
          <Bell size={18} />
        </button>

        <button 
          onClick={handleLogout}
          style={{ 
            width: "40px", 
            height: "40px", 
            borderRadius: "50%", 
            background: "rgba(239, 68, 68, 0.1)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "var(--danger)"
          }}
          title="Çıkış Yap"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
