"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import { Hash, Send, Plus, Users, Settings } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, push, onValue } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function MessagesPage() {
  const { user } = useAuth();
  const params = useParams();
  const companyId = params.companyId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newChannelName, setNewChannelName] = useState("");

  // Kanalları Çek
  useEffect(() => {
    if(!companyId) return;
    const channelsRef = ref(database, `companies/${companyId}/channels`);
    const unsub = onValue(channelsRef, (snap) => {
      const data = snap.val();
      if(data) {
        const cList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setChannels(cList);
        if(!activeChannel && cList.length > 0) setActiveChannel(cList[0].id);
      } else {
        // Varsayılan kanal oluştur
        push(ref(database, `companies/${companyId}/channels`), { name: "genel", createdAt: Date.now() });
      }
    });
    return () => unsub();
  }, [companyId]);

  // Aktif Kanal Mesajlarını Çek
  useEffect(() => {
    if(!companyId || !activeChannel) return;
    const msgsRef = ref(database, `companies/${companyId}/channels/${activeChannel}/messages`);
    const unsub = onValue(msgsRef, (snap) => {
      const data = snap.val();
      if(data) {
        const mList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setMessages(mList);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        setMessages([]);
      }
    });
    return () => unsub();
  }, [companyId, activeChannel]);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newChannelName) return;
    await push(ref(database, `companies/${companyId}/channels`), {
      name: newChannelName.toLowerCase().replace(/\s+/g, '-'),
      createdAt: Date.now()
    });
    setNewChannelName("");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChannel) return;

    await push(ref(database, `companies/${companyId}/channels/${activeChannel}/messages`), {
      text: newMessage,
      senderId: user?.uid,
      senderEmail: user?.email,
      createdAt: Date.now()
    });
    setNewMessage("");
  };

  return (
    <>
      <Header title="Mesajlar ve Kanallar" />
      <main style={{ padding: "0 1rem 1rem 0", flex: 1, display: "flex", overflow: "hidden", gap: "1rem" }}>
        
        {/* Sol Panel: Kanallar */}
        <div className="glass-panel" style={{ width: "250px", display: "flex", flexDirection: "column", padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem" }}>KANALLAR</h3>
          </div>
          
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {channels.map(c => (
              <button 
                key={c.id}
                onClick={() => setActiveChannel(c.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem", borderRadius: "6px",
                  background: activeChannel === c.id ? "rgba(99, 102, 241, 0.2)" : "transparent",
                  color: activeChannel === c.id ? "var(--text-primary)" : "var(--text-secondary)",
                  textAlign: "left"
                }}
              >
                <Hash size={18} color={activeChannel === c.id ? "var(--accent-primary)" : "currentColor"} />
                {c.name}
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateChannel} style={{ display: "flex", marginTop: "1rem" }}>
            <input required className="input-glass" placeholder="yeni-kanal" value={newChannelName} onChange={e=>setNewChannelName(e.target.value)} style={{ padding: "0.5rem", borderRadius: "8px 0 0 8px" }} />
            <button type="submit" className="btn-primary" style={{ padding: "0.5rem", borderRadius: "0 8px 8px 0" }}><Plus size={18}/></button>
          </form>
        </div>

        {/* Sağ Panel: Sohbet Alanı */}
        <div className="glass-panel" style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Hash size={24} color="var(--accent-primary)" />
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600" }}>{channels.find(c => c.id === activeChannel)?.name || "Kanal Seçin"}</h2>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {messages.map(msg => {
              const isMe = msg.senderId === user?.uid;
              return (
                <div key={msg.id} style={{ display: "flex", gap: "1rem", flexDirection: isMe ? "row-reverse" : "row" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: isMe ? "var(--accent-primary)" : "var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: "bold" }}>
                    {msg.senderEmail?.[0].toUpperCase() || "?"}
                  </div>
                  <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", display: "flex", gap: "0.5rem" }}>
                      <span>{msg.senderEmail?.split('@')[0]}</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString("tr-TR", {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div style={{ 
                      padding: "0.75rem 1rem", 
                      borderRadius: isMe ? "12px 0 12px 12px" : "0 12px 12px 12px",
                      background: isMe ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.05)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-primary)",
                      wordBreak: "break-word"
                    }}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: "1rem", borderTop: "1px solid var(--glass-border)" }}>
            <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "1rem" }}>
              <input 
                className="input-glass" 
                placeholder="Markdown destekli mesajınızı yazın... (Örn: **Kalın** veya *İtalik*)" 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)} 
                style={{ flex: 1, padding: "1rem", borderRadius: "12px" }}
              />
              <button type="submit" className="btn-primary" style={{ padding: "0 1.5rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Send size={18} /> Gönder
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
