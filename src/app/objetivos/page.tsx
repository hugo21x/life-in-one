
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  progress: number;
  status: string | null;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadGoals() {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) alert("Erro ao carregar objetivos: " + error.message);
    else setGoals((data ?? []) as Goal[]);
    setLoading(false);
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function addGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert("Inicia sessão novamente.");
      return;
    }

    const { error } = await supabase.from("goals").insert({
      user_id: userData.user.id,
      title: title.trim(),
      description: description.trim() || null,
      target_date: targetDate || null,
      progress: 0,
      status: "Em progresso",
    });

    if (error) {
      alert("Erro ao criar objetivo: " + error.message);
      return;
    }

    setTitle("");
    setDescription("");
    setTargetDate("");
    loadGoals();
  }

  async function updateProgress(id: string, progress: number) {
    const { error } = await supabase
      .from("goals")
      .update({
        progress,
        status: progress === 100 ? "Concluído" : "Em progresso",
      })
      .eq("id", id);

    if (error) alert("Erro ao atualizar progresso: " + error.message);
    else loadGoals();
  }

  async function deleteGoal(id: string) {
    if (!confirm("Queres apagar este objetivo?")) return;

    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) alert("Erro ao apagar objetivo: " + error.message);
    else loadGoals();
  }

  const average = goals.length
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
    : 0;

  return (
    <main className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PLANEAMENTO</p>
          <h1>Os meus objetivos</h1>
          <p className="muted">Acompanha o progresso daquilo que queres alcançar.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="muted">Objetivos totais</span>
          <strong>{goals.length}</strong>
        </div>
        <div className="stat-card">
          <span className="muted">Concluídos</span>
          <strong>{goals.filter((g) => g.progress === 100).length}</strong>
        </div>
        <div className="stat-card">
          <span className="muted">Progresso médio</span>
          <strong>{average}%</strong>
        </div>
      </div>

      <section className="panel">
        <h2>Criar objetivo</h2>
        <form onSubmit={addGoal} className="form-grid">
          <input
            placeholder="Nome do objetivo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className="field-label">
            Data pretendida
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </label>
          <button className="primary-button" type="submit">Criar objetivo</button>
        </form>
      </section>

      <section className="panel">
        <h2>Os teus objetivos</h2>
        {loading ? <p className="muted">A carregar...</p> :
          goals.length === 0 ? (
            <p className="empty-state">Ainda não criaste objetivos.</p>
          ) : (
            <div className="goal-grid">
              {goals.map((goal) => (
                <article className="goal-card" key={goal.id}>
                  <div className="section-heading">
                    <h3>{goal.title}</h3>
                    <span className="status-pill">
                      {goal.progress === 100 ? "Concluído" : "Em progresso"}
                    </span>
                  </div>
                  {goal.description && <p className="muted">{goal.description}</p>}
                  <p className="muted">
                    {goal.target_date ? `Data pretendida: ${goal.target_date}` : "Sem data definida"}
                  </p>
                  <div className="progress-heading">
                    <span>Progresso</span>
                    <strong>{goal.progress}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${goal.progress}%` }} />
                  </div>
                  <label className="field-label">
                    Atualizar progresso
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={goal.progress}
                      onChange={(e) => updateProgress(goal.id, Number(e.target.value))}
                    />
                  </label>
                  <button className="danger-button" onClick={() => deleteGoal(goal.id)}>
                    Apagar objetivo
                  </button>
                </article>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}
