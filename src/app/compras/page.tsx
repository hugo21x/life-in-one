
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  name: string;
  quantity: number;
  purchased: boolean;
};

export default function ComprasPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);

  async function loadItems() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    else setItems(data || []);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const { error } = await supabase.from("shopping_items").insert({
      name,
      quantity
    });

    if (error) alert(error.message);
    else {
      setName("");
      setQuantity(1);
      loadItems();
    }
  }

  async function toggleItem(item: Item) {
    const { error } = await supabase
      .from("shopping_items")
      .update({ purchased: !item.purchased })
      .eq("id", item.id);

    if (error) alert(error.message);
    else loadItems();
  }

  async function deleteItem(id: string) {
    const { error } = await supabase
      .from("shopping_items")
      .delete()
      .eq("id", id);

    if (error) alert(error.message);
    else loadItems();
  }

  return (
    <main style={pageStyle}>
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>
        Lista de Compras
      </h1>

      <form onSubmit={addItem} style={{ marginTop: 30 }}>
        <input
          required
          placeholder="Nome do produto"
          value={name}
          onChange={e => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          style={{ ...inputStyle, maxWidth: 100 }}
        />

        <button style={buttonStyle}>Adicionar</button>
      </form>

      <h2 style={{ marginTop: 35, fontSize: 21 }}>
        Produtos ({items.filter(i => !i.purchased).length} por comprar)
      </h2>

      {items.map(item => (
        <div key={item.id} style={cardStyle}>
          <input
            type="checkbox"
            checked={item.purchased}
            onChange={() => toggleItem(item)}
          />

          <span style={{
            flex: 1,
            textDecoration: item.purchased ? "line-through" : "none",
            color: item.purchased ? "#6b7280" : "white"
          }}>
            {item.name} — Quantidade: {item.quantity}
          </span>

          <button onClick={() => deleteItem(item.id)}>
            Apagar
          </button>
        </div>
      ))}

      {items.length === 0 && (
        <p style={{ color: "#9ca3af", marginTop: 20 }}>
          A tua lista ainda está vazia.
        </p>
      )}

      <a href="/" style={{ display: "block", marginTop: 30, color: "#818cf8" }}>
        ← Voltar ao Dashboard
      </a>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#0b0e14",
  color: "white",
  padding: 40
};

const inputStyle = {
  display: "block",
  padding: 12,
  marginBottom: 12,
  width: "100%",
  maxWidth: 400,
  color: "white",
  background: "#151a23",
  border: "1px solid #374151",
  borderRadius: 8
};

const buttonStyle = {
  padding: 12,
  color: "white",
  background: "#6366f1",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};

const cardStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "#151a23",
  padding: 16,
  borderRadius: 10,
  marginTop: 12
};
