"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { database } from "@/lib/firebase";
import { ref, push, onValue } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { Wallet, TrendingUp, TrendingDown, Plus } from "lucide-react";
// Recharts for graphs
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function FinancePage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("gider"); // gelir, gider

  useEffect(() => {
    const txRef = ref(database, 'finance');
    const unsubscribe = onValue(txRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const txList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setTransactions(txList.reverse());
      } else {
        setTransactions([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    await push(ref(database, 'finance'), {
      amount: Number(amount),
      description,
      type,
      createdBy: user?.uid || "Bilinmiyor",
      createdAt: Date.now()
    });

    setAmount("");
    setDescription("");
  };

  const totalIncome = transactions.filter(t => t.type === 'gelir').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'gider').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = {
    labels: ['Genel Durum'],
    datasets: [
      {
        label: 'Gelir',
        data: [totalIncome],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Gider',
        data: [totalExpense],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#f8fafc' }
      }
    },
    scales: {
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    }
  };

  return (
    <>
      <Header title="Finans ve API Giderleri" />
      <main style={{ padding: "0 1rem 1rem 0", flex: 1, overflowY: "auto" }}>
        
        {/* İstatistikler */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
             <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
               <TrendingUp color="var(--success)" size={24} />
             </div>
             <div>
               <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Toplam Gelir</div>
               <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--success)" }}>₺{totalIncome.toLocaleString()}</div>
             </div>
          </div>
          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
             <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
               <TrendingDown color="var(--danger)" size={24} />
             </div>
             <div>
               <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Toplam Gider</div>
               <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--danger)" }}>₺{totalExpense.toLocaleString()}</div>
             </div>
          </div>
          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
             <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
               <Wallet color="var(--accent-primary)" size={24} />
             </div>
             <div>
               <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Net Durum</div>
               <div style={{ fontSize: "1.5rem", fontWeight: "600" }}>₺{balance.toLocaleString()}</div>
             </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* İşlem Ekleme Formu */}
          <div className="glass-panel fade-in" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Manuel İşlem / API Gideri Ekle</h3>
            <form onSubmit={handleAddTransaction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <select className="input-glass" value={type} onChange={e => setType(e.target.value)} style={{ flex: 1 }}>
                  <option value="gider">Gider (API, vb.)</option>
                  <option value="gelir">Gelir</option>
                </select>
                <input 
                  type="number" 
                  required 
                  className="input-glass" 
                  placeholder="Tutar (₺)" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  style={{ flex: 2 }}
                />
              </div>
              <input 
                type="text" 
                required 
                className="input-glass" 
                placeholder="Açıklama (Örn: OpenAI API Faturalandırması)" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
              <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <Plus size={18} /> İşlemi Kaydet
              </button>
            </form>
          </div>

          {/* Grafik Alanı */}
          <div className="glass-panel fade-in" style={{ padding: "2rem", height: "300px" }}>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Grafiksel Özet</h3>
            <div style={{ height: "calc(100% - 2rem)" }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* İşlem Listesi */}
        <div className="glass-panel fade-in" style={{ marginTop: "1.5rem", padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Son İşlemler</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {transactions.map(tx => (
              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", borderLeft: `3px solid ${tx.type === 'gelir' ? 'var(--success)' : 'var(--danger)'}` }}>
                <div>
                  <div style={{ fontWeight: "500" }}>{tx.description}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{new Date(tx.createdAt).toLocaleString("tr-TR")}</div>
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", color: tx.type === 'gelir' ? 'var(--success)' : 'var(--danger)' }}>
                  {tx.type === 'gelir' ? '+' : '-'}₺{tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
            {transactions.length === 0 && <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1rem" }}>Henüz işlem bulunmuyor.</div>}
          </div>
        </div>

      </main>
    </>
  );
}
