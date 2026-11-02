
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: string;
  category: string | null;
  transaction_date: string;
};

export default function FinancasPage() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("despesa");
  const [category, setCategory] = useState("");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return window.location.assign("/login");

    const { data, error } = await supabase.from("transactions")
      .select("*").order("transaction_date", { ascending: false });

    if (error) alert(error.message);
    else setItems(data || []);
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("transactions").insert({
      title,
      amount: Number(amount),
      type,
      category: category || null
    });

    if (error) alert(error.message);
    else {
      setTitle("");
      setAmount("");
      setCategory("");
      load();
    }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) alert(error.message);
    else load();
  }

  const income = items.filter(i => i.type === "receita")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const expenses = items.filter(i => i.type === "despesa")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const money = (value: number) => value.toLocaleString("pt-PT", {
    style: "currency", currency: "EUR"
  });

  return (
    <main style={page}>
      <h1 style={heading}>As minhas Finanças</h1>

      <section style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
        <div style={card}>
          <p>Receitas</p><h2>{money(income)}</h2>
        </div>
        <div style={card}>
          <p>Despesas</p><h2>{money(expenses)}</h2>
        </div>
        <div style={card}>
          <p>Saldo</p><h2>{money(income - expenses)}</h2>
        </div>
      </section>

      <h2 style={{ margin: "30px 0 15px" }}>Adicionar movimento</h2>

      <form onSubmit={add}>
        <input required placeholder="Descrição" value={title}
          onChange={e => setTitle(e.target.value)} style={input} />

        <input required type="number" min="0.01" step="0.01"
          placeholder="Valor (€)" value={amount}
          onChange={e => setAmount(e.target.value)} style={input} />

        <select value={type} onChange={e => setType(e.target.value)} style={input}>
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>

        <input placeholder="Categoria" value={category}
          onChange={e => setCategory(e.target.value)} style={input} />

        <button style={button}>Guardar movimento</button>
      </form>

      <h2 style={{ marginTop: 35 }}>Histórico</h2>

      {items.map(item => (
        <article key={item.id} style={card}>
          <div style={{ flex: 1 }}>
            <strong>{item.title}</strong>
            <p>{item.category || "Sem categoria"} · {item.transaction_date}</p>
          </div>
          <strong>{money(Number(item.amount))}</strong>
          <button onClick={() => remove(item.id)}>Apagar</button>
        </article>
      ))}

      <a href="/" style={link}>← Dashboard</a>
    </main>
  );
}

const page = { minHeight: "100vh", background: "#0b0e14", color: "white", padding: 40 };
const heading = { fontSize: 32, fontWeight: "bold" as const, marginBottom: 25 };
const input = { display: "block", padding: 12, marginBottom: 12, width: "100%", maxWidth: 450, color: "white", background: "#151a23", border: "1px solid #374151", borderRadius: 8 };
const button = { padding: 12, background: "#6366f1", color: "white", border: 0, borderRadius: 8, cursor: "pointer" };
const card = { display: "flex", gap: 15, alignItems: "center", padding: 18, background: "#151a23", borderRadius: 10, marginTop: 15, flexWrap: "wrap" as const };
const link = { display: "block", marginTop: 30, color: "#818cf8" };
