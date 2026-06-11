"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Plus, Check, Clock, AlertCircle } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, push, onValue, update } from "firebase/database";
import { useAuth } from "@/context/AuthContext";

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  useEffect(() => {
    const tasksRef = ref(database, 'tasks');
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const taskList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setTasks(taskList.reverse());
      } else {
        setTasks([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    await push(ref(database, 'tasks'), {
      title: newTaskTitle,
      description: newTaskDesc,
      status: "beklemede", // beklemede, yapiliyor, yapildi
      createdBy: user?.uid || "Bilinmiyor",
      createdAt: Date.now()
    });

    setNewTaskTitle("");
    setNewTaskDesc("");
  };

  const updateStatus = async (id: string, status: string) => {
    await update(ref(database, `tasks/${id}`), { status });
  };

  const renderTaskColumn = (status: string, title: string, icon: any, color: string) => {
    const columnTasks = tasks.filter(t => t.status === status);
    const Icon = icon;

    return (
      <div className="glass-panel" style={{ flex: 1, padding: "1rem", minWidth: "300px" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", paddingBottom: "0.5rem", borderBottom: `2px solid ${color}` }}>
          <Icon color={color} size={20} />
          {title} ({columnTasks.length})
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {columnTasks.map(task => (
            <div key={task.id} className="glass-panel fade-in" style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderLeft: `3px solid ${color}` }}>
              <div style={{ fontWeight: "500", marginBottom: "0.5rem" }}>{task.title}</div>
              {task.description && <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>{task.description}</div>}
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <span>{new Date(task.createdAt).toLocaleDateString("tr-TR")}</span>
                
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {status !== "beklemede" && (
                    <button onClick={() => updateStatus(task.id, "beklemede")} style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", background: "rgba(245, 158, 11, 0.1)", color: "var(--warning)" }}>Beklemeye Al</button>
                  )}
                  {status !== "yapiliyor" && (
                    <button onClick={() => updateStatus(task.id, "yapiliyor")} style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", background: "rgba(99, 102, 241, 0.1)", color: "var(--accent-primary)" }}>Başla</button>
                  )}
                  {status !== "yapildi" && (
                    <button onClick={() => updateStatus(task.id, "yapildi")} style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", background: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }}>Bitir</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {columnTasks.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem 0", fontSize: "0.9rem" }}>Görev bulunamadı.</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Header title="Görevler ve Fikirler" />
      <main style={{ padding: "0 1rem 1rem 0", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Yeni Görev Ekleme Alanı */}
        <div className="glass-panel fade-in" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <form onSubmit={handleAddTask} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <input 
                required 
                className="input-glass" 
                placeholder="Görev veya fikir başlığı..." 
                value={newTaskTitle} 
                onChange={e => setNewTaskTitle(e.target.value)} 
              />
              <input 
                className="input-glass" 
                placeholder="Açıklama (İsteğe bağlı)" 
                value={newTaskDesc} 
                onChange={e => setNewTaskDesc(e.target.value)} 
              />
            </div>
            <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "45px" }}>
              <Plus size={18} /> Ekle
            </button>
          </form>
        </div>

        {/* Kanban Panosu */}
        <div style={{ display: "flex", gap: "1.5rem", flex: 1, overflowX: "auto", paddingBottom: "1rem" }}>
          {renderTaskColumn("beklemede", "Bekliyor / Fikir", AlertCircle, "var(--warning)")}
          {renderTaskColumn("yapiliyor", "Yapılıyor", Clock, "var(--accent-primary)")}
          {renderTaskColumn("yapildi", "Tamamlandı", Check, "var(--success)")}
        </div>
      </main>
    </>
  );
}
