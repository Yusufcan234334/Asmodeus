"use client";

import Header from "@/components/Header";
import { Users, CheckSquare, Wallet, Bot } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { title: "Aktif Görevler", value: "12", icon: CheckSquare, color: "var(--accent-primary)" },
    { title: "Aylık Gider", value: "₺4,250", icon: Wallet, color: "var(--danger)" },
    { title: "Ekip Üyeleri", value: "8", icon: Users, color: "var(--success)" },
    { title: "Aktif AI Ajanları", value: "3", icon: Bot, color: "var(--warning)" }
  ];

  return (
    <>
      <Header title="Genel Bakış" />
      <main style={{ padding: "0 1rem 1rem 0", flex: 1, overflowY: "auto" }}>
        {/* Stat Kartları */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-panel fade-in" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", animationDelay: `${i * 0.1}s` }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `rgba(255,255,255,0.05)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon color={stat.color} size={24} />
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>{stat.title}</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "600" }}>{stat.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Son Aktiviteler ve Giderler */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
          <div className="glass-panel fade-in" style={{ padding: "1.5rem", animationDelay: "0.4s" }}>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: "500" }}>Son Görevler</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "500" }}>Örnek Görev {i}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Oluşturan: Ahmet Yılmaz</div>
                  </div>
                  <span style={{ padding: "0.25rem 0.75rem", background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", borderRadius: "20px", fontSize: "0.8rem" }}>Yapıldı</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel fade-in" style={{ padding: "1.5rem", animationDelay: "0.5s" }}>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: "500" }}>Son API Giderleri</h3>
             <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.75rem", borderBottom: "1px solid var(--glass-border)" }}>
                  <span style={{ color: "var(--text-secondary)" }}>OpenAI API</span>
                  <span style={{ fontWeight: "500", color: "var(--danger)" }}>-$12.50</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
