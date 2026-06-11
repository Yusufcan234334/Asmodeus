"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "@/lib/firebase";
import { ref, set, push, onValue } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { Building, LogIn, Plus } from "lucide-react";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Auth States
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Company States
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    if (user) {
      setLoadingCompanies(true);
      const userRef = ref(database, `users/${user.uid}/companies`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const compList = Object.keys(data).map(key => ({
            id: key,
            role: data[key].role,
            name: data[key].name
          }));
          setCompanies(compList);
        } else {
          setCompanies([]);
        }
        setLoadingCompanies(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await set(ref(database, 'users/' + userCredential.user.uid), {
          name: name,
          email: email,
          createdAt: Date.now()
        });
      }
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    }
  };

  const createCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName || !user) return;

    // Generate a random 6 char invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create company node
    const newCompRef = push(ref(database, 'companies'));
    const companyId = newCompRef.key;

    await set(newCompRef, {
      name: newCompanyName,
      inviteCode: inviteCode,
      createdAt: Date.now(),
      members: {
        [user.uid]: { role: "owner", email: user.email }
      }
    });

    // Add to user's companies
    await set(ref(database, `users/${user.uid}/companies/${companyId}`), {
      name: newCompanyName,
      role: "owner"
    });

    setNewCompanyName("");
    router.push(`/${companyId}`);
  };

  const joinCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || !user) return;

    // This is a naive join. In a real app, use Cloud Functions to search for the invite code.
    // Here we assume the client downloads all companies to find the code (Not secure for large apps, but works for demo).
    const companiesRef = ref(database, 'companies');
    onValue(companiesRef, async (snapshot) => {
      const data = snapshot.val();
      let foundCompanyId = null;
      let foundCompanyName = "";

      if (data) {
        for (const [id, comp] of Object.entries<any>(data)) {
          if (comp.inviteCode === joinCode) {
            foundCompanyId = id;
            foundCompanyName = comp.name;
            break;
          }
        }
      }

      if (foundCompanyId) {
        // Add user to company members
        await set(ref(database, `companies/${foundCompanyId}/members/${user.uid}`), {
          role: "employee",
          email: user.email
        });
        // Add company to user's list
        await set(ref(database, `users/${user.uid}/companies/${foundCompanyId}`), {
          name: foundCompanyName,
          role: "employee"
        });
        setJoinCode("");
        router.push(`/${foundCompanyId}`);
      } else {
        setError("Geçersiz davet kodu!");
      }
    }, { onlyOnce: true });
  };

  if (loading) return <div className="fade-in" style={{ padding: "2rem", textAlign: "center" }}>Yükleniyor...</div>;

  if (user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "800px", marginBottom: "2rem" }}>
          <h1 style={{ color: "var(--accent-primary)" }}>Tulumba v2</h1>
          <button onClick={logout} style={{ color: "var(--danger)" }}>Çıkış Yap</button>
        </div>

        <div style={{ width: "100%", maxWidth: "800px", display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          
          <div className="glass-panel fade-in" style={{ padding: "2rem" }}>
            <h2 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Building size={20}/> Şirketlerim</h2>
            {loadingCompanies ? <p>Yükleniyor...</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {companies.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => router.push(`/${c.id}`)}
                    className="btn-primary" 
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "white", display: "flex", justifyContent: "space-between" }}
                  >
                    <span>{c.name}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{c.role}</span>
                  </button>
                ))}
                {companies.length === 0 && <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Henüz bir şirkete üye değilsiniz.</p>}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="glass-panel fade-in" style={{ padding: "2rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>Yeni Şirket Kur</h3>
              <form onSubmit={createCompany} style={{ display: "flex", gap: "0.5rem" }}>
                <input required className="input-glass" placeholder="Şirket Adı" value={newCompanyName} onChange={e=>setNewCompanyName(e.target.value)} />
                <button type="submit" className="btn-primary" style={{ padding: "0.5rem" }}><Plus /></button>
              </form>
            </div>

            <div className="glass-panel fade-in" style={{ padding: "2rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>Şirkete Katıl</h3>
              <form onSubmit={joinCompany} style={{ display: "flex", gap: "0.5rem" }}>
                <input required className="input-glass" placeholder="6 Haneli Davet Kodu" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} maxLength={6} />
                <button type="submit" className="btn-primary" style={{ padding: "0.5rem", background: "var(--success)" }}><LogIn /></button>
              </form>
              {error && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.5rem" }}>{error}</p>}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Not logged in UI
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div className="glass-panel fade-in" style={{ padding: "2rem", width: "100%", maxWidth: "400px" }}>
        <h1 style={{ marginBottom: "1.5rem", textAlign: "center", color: "var(--accent-primary)" }}>Tulumba</h1>
        <h2 style={{ marginBottom: "1rem", textAlign: "center", fontSize: "1.2rem" }}>
          {isLogin ? "Giriş Yap" : "Hesap Oluştur"}
        </h2>
        
        {error && <div style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}
        
        <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {!isLogin && (
            <input 
              type="text" placeholder="Ad Soyad" className="input-glass"
              value={name} onChange={(e) => setName(e.target.value)} required 
            />
          )}
          <input 
            type="email" placeholder="E-posta" className="input-glass"
            value={email} onChange={(e) => setEmail(e.target.value)} required 
          />
          <input 
            type="password" placeholder="Şifre" className="input-glass"
            value={password} onChange={(e) => setPassword(e.target.value)} required 
          />
          <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem" }}>
            {isLogin ? "Giriş" : "Kayıt Ol"}
          </button>
        </form>
        
        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
          {isLogin ? "Hesabınız yok mu? " : "Zaten hesabınız var mı? "}
          <button 
            type="button" onClick={() => setIsLogin(!isLogin)}
            style={{ color: "var(--accent-primary)", fontWeight: "500", textDecoration: "underline" }}
          >
            {isLogin ? "Hesap Oluştur" : "Giriş Yap"}
          </button>
        </div>
      </div>
    </div>
  );
}
