"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { database } from "@/lib/firebase";
import { ref, onValue, update, remove } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import { Users, Shield, UserX } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const params = useParams();
  const companyId = params.companyId as string;
  
  const [members, setMembers] = useState<any[]>([]);
  const [myRole, setMyRole] = useState("employee");

  useEffect(() => {
    if(!companyId) return;
    const membersRef = ref(database, `companies/${companyId}/members`);
    const unsub = onValue(membersRef, (snap) => {
      const data = snap.val();
      if(data) {
        const mList = Object.keys(data).map(k => ({uid:k, ...data[k]}));
        setMembers(mList);
        const me = mList.find(m => m.uid === user?.uid);
        if(me) setMyRole(me.role);
      }
    });
    return () => unsub();
  }, [companyId, user?.uid]);

  const changeRole = async (uid: string, newRole: string) => {
    if(myRole !== "owner" && myRole !== "admin") {
      alert("Rol değiştirme yetkiniz yok!");
      return;
    }
    await update(ref(database, `companies/${companyId}/members/${uid}`), { role: newRole });
    await update(ref(database, `users/${uid}/companies/${companyId}`), { role: newRole });
  };

  const kickMember = async (uid: string) => {
    if(myRole !== "owner" && myRole !== "admin") {
      alert("Kovma yetkiniz yok!");
      return;
    }
    if(confirm("Bu kullanıcıyı şirketten çıkarmak istediğinize emin misiniz?")) {
      await remove(ref(database, `companies/${companyId}/members/${uid}`));
      await remove(ref(database, `users/${uid}/companies/${companyId}`));
    }
  };

  return (
    <>
      <Header title="Ekip ve Ayarlar" />
      <main style={{ padding: "0 1rem 1rem 0", flex: 1, overflowY: "auto" }}>
        
        <div className="glass-panel fade-in" style={{ padding: "1.5rem", maxWidth: "800px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <Users color="var(--accent-primary)" />
            <h2 style={{ fontSize: "1.2rem", fontWeight: "500" }}>Ekip Yönetimi</h2>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "2rem" }}>
            Mevcut rolünüz: <strong style={{ color: "var(--success)", textTransform: "uppercase" }}>{myRole}</strong>
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {members.map(m => (
              <div key={m.uid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                <div>
                  <div style={{ fontWeight: "500" }}>{m.email} {m.uid === user?.uid && "(Siz)"}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
                    <Shield size={14}/> Rol: {m.role}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  {(myRole === "owner" || myRole === "admin") && m.role !== "owner" && (
                    <>
                      <select 
                        className="input-glass" 
                        value={m.role} 
                        onChange={(e) => changeRole(m.uid, e.target.value)}
                        style={{ padding: "0.25rem 0.5rem", height: "auto" }}
                      >
                        <option value="employee">Çalışan</option>
                        <option value="admin">Yönetici</option>
                      </select>
                      <button onClick={() => kickMember(m.uid)} style={{ color: "var(--danger)", padding: "0.5rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px" }}>
                        <UserX size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}
