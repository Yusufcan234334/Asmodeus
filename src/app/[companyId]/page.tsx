"use client";

import Header from "@/components/Header";
import { Users, CheckSquare, Wallet, Bot, Copy } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export default function DashboardPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [companyName, setCompanyName] = useState("Yükleniyor...");
  const [inviteCode, setInviteCode] = useState("");
  
  const [stats, setStats] = useState({
    tasks: 0,
    finance: 0,
    members: 0,
    agents: 0
  });

  useEffect(() => {
    if(!companyId) return;

    // Şirket Bilgileri
    const compRef = ref(database, `companies/${companyId}`);
    const unsubComp = onValue(compRef, (snap) => {
      if(snap.val()) {
        setCompanyName(snap.val().name);
        setInviteCode(snap.val().inviteCode);
        setStats(prev => ({ ...prev, members: Object.keys(snap.val().members || {}).length }));
      }
    });

    // Görev Sayısı
    const tasksRef = ref(database, `companies/${companyId}/tasks`);
    const unsubTasks = onValue(tasksRef, (snap) => {
      setStats(prev => ({ ...prev, tasks: snap.val() ? Object.keys(snap.val()).length : 0 }));
    });

    // Ajan Sayısı
    const agentsRef = ref(database, `companies/${companyId}/agents`);
    const unsubAgents = onValue(agentsRef, (snap) => {
      setStats(prev => ({ ...prev, agents: snap.val() ? Object.keys(snap.val()).length : 0 }));
    });

    return () => { unsubComp(); unsubTasks(); unsubAgents(); };
  }, [companyId]);

  const statCards = [
    { title: "Toplam Görev", value: stats.tasks.toString(), icon: CheckSquare, color: "var(--accent-primary)" },
    { title: "Net Finans Durumu", value: "Finans Sekmesine Bakınız", icon: Wallet, color: "var(--danger)" },
    { title: "Ekip Üyeleri", value: stats.members.toString(), icon: Users, color: "var(--success)" },
    { title: "Aktif AI Ajanları", value: stats.agents.toString(), icon: Bot, color: "var(--warning)" }
  ];

  return (
    <>
      <Header title={`${companyName} - Genel Bakış`} />
      <main style={{ padding: "0 1rem 1rem 0", flex: 1, overflowY: "auto" }}>
        
        <div className="glass-panel fade-in" style={{ padding: "1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>Hoş Geldiniz!</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Ekip üyelerini davet etmek için aşağıdaki kodu kullanın.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(0,0,0,0.2)", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px dashed var(--glass-border)" }}>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Davet Kodu:</span>
            <strong style={{ fontSize: "1.2rem", letterSpacing: "2px", color: "var(--accent-primary)" }}>{inviteCode}</strong>
            <button onClick={() => navigator.clipboard.writeText(inviteCode)} style={{ padding: "0.5rem", background: "rgba(255,255,255,0.1)", borderRadius: "4px" }}><Copy size={16}/></button>
          </div>
        </div>

        {/* Stat Kartları */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-panel fade-in" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", animationDelay: `${i * 0.1}s` }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `rgba(255,255,255,0.05)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon color={stat.color} size={24} />
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>{stat.title}</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>{stat.value}</div>
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </>
  );
}
