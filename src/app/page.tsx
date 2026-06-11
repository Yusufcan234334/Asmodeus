"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return <div className="fade-in" style={{ padding: "2rem", textAlign: "center" }}>Yükleniyor...</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Veritabanında kullanıcı profilini oluştur
        await set(ref(database, 'users/' + user.uid), {
          name: name,
          email: email,
          role: "employee", // varsayılan rol
          description: "",
          nickname: "",
          jobTitle: "",
          experience: "",
          createdAt: Date.now()
        });
        
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div className="glass-panel fade-in" style={{ padding: "2rem", width: "100%", maxWidth: "400px" }}>
        <h1 style={{ marginBottom: "1.5rem", textAlign: "center", color: "var(--accent-primary)" }}>Tulumba</h1>
        <h2 style={{ marginBottom: "1rem", textAlign: "center", fontSize: "1.2rem" }}>
          {isLogin ? "Giriş Yap" : "Hesap Oluştur"}
        </h2>
        
        {error && <div style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Ad Soyad" 
              className="input-glass"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          )}
          <input 
            type="email" 
            placeholder="E-posta" 
            className="input-glass"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Şifre" 
            className="input-glass"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          
          <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem" }}>
            {isLogin ? "Giriş" : "Kayıt Ol"}
          </button>
        </form>
        
        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
          {isLogin ? "Hesabınız yok mu? " : "Zaten hesabınız var mı? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: "var(--accent-primary)", fontWeight: "500", textDecoration: "underline" }}
          >
            {isLogin ? "Hesap Oluştur" : "Giriş Yap"}
          </button>
        </div>
      </div>
    </div>
  );
}
