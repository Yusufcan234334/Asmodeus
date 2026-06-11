"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Bot, Plus, Trash2, Play, Save } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, push, onValue, remove, set } from "firebase/database";
import { useAuth } from "@/context/AuthContext";

export default function AgentsPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Yeni Ajan Form State'leri
  const [agentName, setAgentName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [apiMethod, setApiMethod] = useState("GET");
  const [apiOwner, setApiOwner] = useState("");
  const [expectedResult, setExpectedResult] = useState("");

  useEffect(() => {
    const agentsRef = ref(database, 'agents');
    const unsubscribe = onValue(agentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const agentList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setAgents(agentList);
      } else {
        setAgents([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName || !apiUrl || !apiOwner) return;

    const agentsRef = ref(database, 'agents');
    await push(agentsRef, {
      name: agentName,
      url: apiUrl,
      method: apiMethod,
      owner: apiOwner,
      expectedResult: expectedResult,
      createdBy: user?.uid,
      createdAt: Date.now()
    });

    setIsModalOpen(false);
    setAgentName("");
    setApiUrl("");
    setApiOwner("");
    setExpectedResult("");
  };

  const handleDelete = async (id: string) => {
    if(confirm("Bu ajanı silmek istediğinize emin misiniz?")) {
      await remove(ref(database, `agents/${id}`));
    }
  };

  const testAgent = async (agent: any) => {
    try {
      alert(`${agent.name} için İstek Gönderiliyor...\nMethod: ${agent.method}\nURL: ${agent.url}`);
      // Gerçek istek atmak için fetch kullanılabilir (CORS nedeniyle sunucu tarafı bir proxy gerekebilir, şimdilik mock)
      // const res = await fetch(agent.url, { method: agent.method });
      // const data = await res.json();
    } catch(err) {
      alert("İstek başarısız!");
    }
  };

  return (
    <>
      <Header title="AI Ajan Modülleri" />
      <main style={{ padding: "0 1rem 1rem 0", flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "500" }}>Ajan Yöneticisi</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Sisteme dış API'ler ekleyerek özel ajanlar oluşturun.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={18} /> Yeni Ajan Ekle
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {agents.map((agent) => (
            <div key={agent.id} className="glass-panel fade-in" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(99, 102, 241, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Bot color="var(--accent-primary)" />
                  </div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "500" }}>{agent.name}</h3>
                </div>
                <button onClick={() => handleDelete(agent.id)} style={{ color: "var(--danger)" }}><Trash2 size={18} /></button>
              </div>
              
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <p><strong>Sahibi:</strong> {agent.owner}</p>
                <p><strong>Method:</strong> <span style={{ color: "var(--success)" }}>{agent.method}</span></p>
                <p style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><strong>URL:</strong> {agent.url}</p>
                <p><strong>Beklenen Sonuç:</strong> {agent.expectedResult || "-"}</p>
              </div>

              <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--glass-border)" }}>
                <button onClick={() => testAgent(agent)} className="btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.5rem", background: "rgba(16, 185, 129, 0.2)", color: "var(--success)", border: "1px solid var(--success)" }}>
                  <Play size={16} /> Test Et
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div className="glass-panel fade-in" style={{ width: "100%", maxWidth: "500px", padding: "2rem", background: "var(--bg-color)" }}>
              <h2 style={{ marginBottom: "1.5rem" }}>Yeni AI Ajanı Ekle</h2>
              <form onSubmit={handleSaveAgent} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Ajan (Araç) Adı</label>
                  <input required className="input-glass" value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Örn: Fatura Okuyucu AI" />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>API Sahibi / Sorumlu</label>
                  <input required className="input-glass" value={apiOwner} onChange={e => setApiOwner(e.target.value)} placeholder="Örn: Ahmet (Finans)" />
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>HTTP Method</label>
                    <select className="input-glass" value={apiMethod} onChange={e => setApiMethod(e.target.value)}>
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Endpoint URL</label>
                    <input required type="url" className="input-glass" value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://api.example.com/v1/..." />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Beklenen Sonuç Formatı</label>
                  <input className="input-glass" value={expectedResult} onChange={e => setExpectedResult(e.target.value)} placeholder="Örn: JSON { status: 'ok', data: [...] }" />
                </div>
                
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "0.75rem 1.5rem", color: "var(--text-secondary)" }}>İptal</button>
                  <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Save size={18} /> Kaydet</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
