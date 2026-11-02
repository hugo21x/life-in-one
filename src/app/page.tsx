
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Stats = {
  tasks: number;
  completedTasks: number;
  goals: number;
  events: number;
  shopping: number;
  routines: number;
};

const cards = [
  { name: "Objetivos", path: "/objetivos", icon: "🎯" },
  { name: "Tarefas", path: "/tarefas", icon: "✅" },
  { name: "Rotinas", path: "/rotinas", icon: "🔁" },
  { name: "Calendário", path: "/calendario", icon: "📅" },
  { name: "Compras", path: "/compras", icon: "🛒" },
  { name: "Treino", path: "/treino", icon: "🏋️" },
  { name: "Alimentação", path: "/alimentacao", icon: "🥗" },
  { name: "Lista de desejos", path: "/desejos", icon: "⭐" },
  { name: "Viagens", path: "/viagens", icon: "✈️" },
  { name: "Finanças", path: "/financas", icon: "💰" },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    tasks: 0,
    completedTasks: 0,
    goals: 0,
    events: 0,
    shopping: 0,
    routines: 0,
  });

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      setEmail(userData.user.email ?? "");

      const [
        tasksResult,
        completedResult,
        goalsResult,
        eventsResult,
        shoppingResult,
        routinesResult,
      ] = await Promise.all([
        supabase.from("tasks").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("completed", true),
        supabase.from("goals").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("shopping_items").select("*", { count: "exact", head: true }).eq("purchased", false),
        supabase.from("routines").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        tasks: tasksResult.count ?? 0,
        completedTasks: completedResult.count ?? 0,
        goals: goalsResult.count ?? 0,
        events: eventsResult.count ?? 0,
        shopping: shoppingResult.count ?? 0,
        routines: routinesResult.count ?? 0,
      });

      setLoading(false);
    }

    loadDashboard();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const pendingTasks = stats.tasks - stats.completedTasks;

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0b0f17",
      color: "#ffffff",
      padding: "35px",
      fontFamily: "Arial, sans-serif",
    }}>
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
      }}>
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "35px",
        }}>
          <div>
            <h1 style={{ fontSize: "32px", margin: 0 }}>
              Life Manager
            </h1>
            <p style={{ color: "#9ca3af" }}>
              Bem-vindo{email ? `, ${email}` : ""}!
            </p>
          </div>

          <button onClick={logout} style={{
            background: "#202938",
            color: "white",
            border: "1px solid #374151",
            borderRadius: "10px",
            padding: "11px 18px",
            cursor: "pointer",
          }}>
            Terminar sessão
          </button>
        </header>

        <h2 style={{ marginBottom: "18px" }}>Resumo geral</h2>

        {loading ? (
          <p style={{ color: "#9ca3af" }}>A carregar os teus dados...</p>
        ) : (
          <section style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "40px",
          }}>
            {[
              ["Tarefas pendentes", pendingTasks],
              ["Tarefas concluídas", stats.completedTasks],
              ["Objetivos", stats.goals],
              ["Próximas marcações", stats.events],
              ["Itens por comprar", stats.shopping],
              ["Rotinas", stats.routines],
            ].map(([label, value]) => (
              <div key={label} style={{
                background: "#151c29",
                border: "1px solid #263244",
                borderRadius: "14px",
                padding: "22px",
              }}>
                <p style={{ color: "#9ca3af", margin: 0 }}>{label}</p>
                <strong style={{ fontSize: "32px" }}>{value}</strong>
              </div>
            ))}
          </section>
        )}

        <h2 style={{ marginBottom: "18px" }}>As minhas áreas</h2>

        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "15px",
        }}>
          {cards.map((card) => (
            <Link key={card.path} href={card.path} style={{
              background: "#151c29",
              border: "1px solid #263244",
              borderRadius: "14px",
              padding: "22px",
              color: "white",
              textDecoration: "none",
              display: "block",
            }}>
              <span style={{ fontSize: "28px" }}>{card.icon}</span>
              <h3 style={{ marginBottom: 0 }}>{card.name}</h3>
              <p style={{ color: "#9ca3af", fontSize: "13px" }}>
                Abrir área →
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
