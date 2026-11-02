
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ViagensPage() {
  const [items, setItems] = useState<any[]>([]);
  const [destination, setDestination] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return window.location.assign("/login");
    const { data, error } = await supabase.from("trips").select("*").order("start_date", { ascending: true });
    if (error) alert(error.message);
    else setItems(data || []);
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("trips").insert({
      destination,
      start_date: start || null,
      end_date: end || null,
      budget: budget ? Number(budget) : null,
      notes
    });
    if (error) alert(error.message);
    else {
      setDestination(""); setStart(""); setEnd(""); setBudget(""); setNotes("");
      load();
    }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) alert(error.message);
    else load();
  }

  return (
    <main style={page}>
      <h1 style={heading}>Viagens e Férias</h1>
      <form onSubmit={add}>
        <input required placeholder="Destino" value={destination} onChange={e => setDestination(e.target.value)} style={input} />
        <label>Data de início</label>
        <input type="date" value={start} onChange={e => setStart(e.target.value)} style={input} />
        <label>Data de fim</label>
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} style={input} />
        <input type="number" min="0" step="0.01" placeholder="Orçamento (€)" value={budget} onChange={e => setBudget(e.target.value)} style={input} />
        <textarea placeholder="Notas e planos" value={notes} onChange={e => setNotes(e.target.value)} style={input} />
        <button style={button}>Adicionar viagem</button>
      </form>
      {items.map(item => (
        <article key={item.id} style={card}>
          <div style={{ flex: 1 }}>
            <strong>{item.destination}</strong>
            <p>{item.start_date || "Data por definir"} — {item.end_date || "Data por definir"}</p>
            <p>{item.budget != null ? `${item.budget} €` : "Orçamento por definir"}</p>
            <p>{item.notes}</p>
          </div>
          <button onClick={() => remove(item.id)}>Apagar</button>
        </article>
      ))}
      <a href="/" style={link}>← Dashboard</a>
    </main>
  );
}

const page = { minHeight: "100vh", background: "#0b0e14", color: "white", padding: 40 };
const heading = { fontSize: 32, fontWeight: "bold" as const, marginBottom: 25 };
const input = { display: "block", padding: 12, margin: "8px 0 16px", width: "100%", maxWidth: 450, color: "white", background: "#151a23", border: "1px solid #374151", borderRadius: 8 };
const button = { padding: 12, background: "#6366f1", color: "white", border: 0, borderRadius: 8, cursor: "pointer" };
const card = { display: "flex", gap: 15, alignItems: "center", padding: 18, background: "#151a23", borderRadius: 10, marginTop: 15 };
const link = { display: "block", marginTop: 30, color: "#818cf8" };
