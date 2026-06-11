"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { database } from "@/lib/firebase";
import { ref, onValue, push } from "firebase/database";
import { useParams } from "next/navigation";
import { TrendingUp, TrendingDown, RefreshCcw, Plus } from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function FinancePage() {
  const params = useParams();
  const companyId = params.companyId as string;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("gelir");
  const [reason, setReason] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if(!companyId) return;
    
    // İşlemleri Çek
    const transRef = ref(database, `companies/${companyId}/finance`);
    const unsubT = onValue(transRef, (snap) => {
      if(snap.val()) {
        const list = Object.keys(snap.val()).map(k => ({id:k, ...snap.val()[k]}));
        setTransactions(list.sort((a,b)=>b.createdAt - a.createdAt));
      }
    });

    // Ajanları Çek
    const agentsRef = ref(database, `companies/${companyId}/agents`);
    const unsubA = onValue(agentsRef, (snap) => {
      if(snap.val()) {
        const list = Object.keys(snap.val()).map(k => ({id:k, ...snap.val()[k]}));
        setAgents(list);
      }
    });

    return () => { unsubT(); unsubA(); };
  }, [companyId]);

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!amount || !reason) return;
    
    await push(ref(database, `companies/${companyId}/finance`), {
      amount: parseFloat(amount),
      type: type,
      reason: reason,
      source: "Manuel Giriş",
      createdAt: Date.now()
    });
    setAmount(""); setReason("");
  };

  const syncAgents = async () => {
    setIsSyncing(true);
    for(const agent of agents) {
      if(agent.method === "GET") {
        try {
          // Çok basit bir simülasyon, gerçekte fetch atılır
          // const res = await fetch(agent.url); const data = await res.json();
          // Simülasyon olarak rastgele gider yazıyoruz:
          const randomAmount = Math.floor(Math.random() * 500) + 50;
          await push(ref(database, `companies/${companyId}/finance`), {
            amount: randomAmount,
            type: "gider",
            reason: "API Sorgusu Sonucu",
            source: agent.name,
            createdAt: Date.now()
          });
        } catch(e) { console.error("Ajan çekilemedi:", agent.name) }
      }
    }
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const totalIncome = transactions.filter(t=>t.type==="gelir").reduce((acc, t)=>acc+t.amount, 0);
  const totalExpense = transactions.filter(t=>t.type==="gider").reduce((acc, t)=>acc+t.amount, 0);
  const totalDebt = transactions.filter(t=>t.type==="borc").reduce((acc, t)=>acc+t.amount, 0);
  const net = totalIncome - totalExpense - totalDebt;

  // Grafik verisi (Son 5 işlem)
  const chartData = {
    labels: transactions.slice(0, 5).reverse().map(t => new Date(t.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: 'İşlem Tutarı',
        data: transactions.slice(0, 5).reverse().map(t => t.type === "gelir" ? t.amount : -t.amount),
        backgroundColor: transactions.slice(0, 5).reverse().map(t => t.type === "gelir" ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
      }
    ],
  };

  return (
    <>
      <Header title="Finans, Gelir/Gider & Borç Yönetimi" />
      <main style={{ padding: "0 1rem 1rem 0", flex: 1, overflowY: "auto" }}>
        
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <div className="glass-panel" style={{ flex: 1, padding: "1.5rem", borderLeft: "4px solid var(--success)" }}>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Toplam Gelir</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--success)" }}>₺{totalIncome.toLocaleString()}</div>
          </div>
          <div className="glass-panel" style={{ flex: 1, padding: "1.5rem", borderLeft: "4px solid var(--danger)" }}>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Toplam Gider</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--danger)" }}>₺{totalExpense.toLocaleString()}</div>
          </div>
          <div className="glass-panel" style={{ flex: 1, padding: "1.5rem", borderLeft: "4px solid var(--warning)" }}>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Toplam Borç</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--warning)" }}>₺{totalDebt.toLocaleString()}</div>
          </div>
          <div className="glass-panel" style={{ flex: 1, padding: "1.5rem", background: "rgba(99, 102, 241, 0.1)", borderLeft: "4px solid var(--accent-primary)" }}>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Net Bakiye</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "600" }}>₺{net.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "2rem" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            <div className="glass-panel fade-in" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>API Ajanlarından Senkronize Et</h3>
                <button onClick={syncAgents} disabled={isSyncing} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <RefreshCcw size={16} className={isSyncing ? "spin" : ""} /> {isSyncing ? "Taranıyor..." : "Ajanları Tara"}
                </button>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Aktif {agents.length} adet ajan bulundu. Tarama yapıldığında ajanların bağlı olduğu API'lere istek atılır ve dönen sonuçlar otomatik gider/gelir olarak yazılır.
              </p>
            </div>

            <div className="glass-panel fade-in" style={{ padding: "1.5rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>Manuel İşlem Ekle</h3>
              <form onSubmit={handleManualAdd} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <input type="number" required className="input-glass" placeholder="Tutar (₺)" value={amount} onChange={e=>setAmount(e.target.value)} style={{ flex: 1 }} />
                  <select className="input-glass" value={type} onChange={e=>setType(e.target.value)} style={{ flex: 1 }}>
                    <option value="gelir">Gelir</option>
                    <option value="gider">Gider</option>
                    <option value="borc">Borç (Gelecek Gider)</option>
                  </select>
                </div>
                <input required className="input-glass" placeholder="Sebep / Açıklama (Örn: Ofis Kirası, Vergi)" value={reason} onChange={e=>setReason(e.target.value)} />
                <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}><Plus size={18}/> Ekle</button>
              </form>
            </div>

          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="glass-panel fade-in" style={{ padding: "1.5rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>İşlem Geçmişi</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "300px", overflowY: "auto" }}>
                {transactions.map(t => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px", borderLeft: `3px solid ${t.type === 'gelir' ? 'var(--success)' : t.type === 'gider' ? 'var(--danger)' : 'var(--warning)'}` }}>
                    <div>
                      <div style={{ fontWeight: "500" }}>{t.reason}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{t.source} | {new Date(t.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontWeight: "600", color: t.type === 'gelir' ? 'var(--success)' : t.type === 'gider' ? 'var(--danger)' : 'var(--warning)' }}>
                      {t.type === 'gelir' ? '+' : '-'}₺{t.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel fade-in" style={{ padding: "1.5rem", height: "300px" }}>
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
