"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { database } from "@/lib/firebase";
import { ref, push, onValue } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { Send, Mail } from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const msgRef = ref(database, 'messages');
    const unsubscribe = onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setMessages(msgList); // Keep chronological order for chat
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage) return;

    await push(ref(database, 'messages'), {
      text: newMessage,
      sender: user?.email || "Bilinmiyor",
      createdAt: Date.now()
    });

    setNewMessage("");
  };

  return (
    <>
      <Header title="Kurum İçi İletişim" />
      <main style={{ padding: "0 1rem 1rem 0", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        <div className="glass-panel" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "1.5rem", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1rem", marginBottom: "1rem" }}>
            <Mail color="var(--text-secondary)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: "500" }}>Genel Sohbet Kanalı</h3>
          </div>

          {/* Mesaj Listesi */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", paddingRight: "1rem" }}>
            {messages.map(msg => {
              const isMine = msg.sender === user?.email;
              return (
                <div key={msg.id} className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", padding: "0 0.5rem" }}>
                    {msg.sender.split('@')[0]} • {new Date(msg.createdAt).toLocaleTimeString("tr-TR", {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div style={{ 
                    padding: "0.75rem 1rem", 
                    borderRadius: "16px",
                    background: isMine ? "var(--accent-primary)" : "rgba(255,255,255,0.1)",
                    color: "white",
                    maxWidth: "80%",
                    borderBottomRightRadius: isMine ? "4px" : "16px",
                    borderBottomLeftRadius: !isMine ? "4px" : "16px"
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "2rem" }}>İlk mesajı siz gönderin!</div>}
          </div>

          {/* Mesaj Gönderme */}
          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <input 
              required
              className="input-glass" 
              placeholder="Mesajınızı yazın..." 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)}
              style={{ flex: 1, background: "rgba(0,0,0,0.3)" }}
            />
            <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderRadius: "50%", width: "50px", height: "50px", padding: 0, justifyContent: "center" }}>
              <Send size={20} />
            </button>
          </form>
        </div>

      </main>
    </>
  );
}
