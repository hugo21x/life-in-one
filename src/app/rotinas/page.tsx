
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Routine = {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
};

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadRoutines() {
    const { data, error } = await supabase
      .from("routines")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) alert("Erro ao carregar rotinas: " + error.message);
    else setRoutines((data ?? []) as Routine[]);
    setLoading(false);
  }

  useEffect(() => {
    loadRoutines();
  }, []);

  async function addRoutine(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert("Inicia sessão novamente.");
      return;
    }

    const { error } = await supabase.from("routines").insert({
      user_id: userData.user.id,
      title: title.trim(),
      completed: false,
    });

    if (error) {
      alert("Erro ao criar rotina: " + error.message);
      return;
    }

    setTitle("");
    loadRoutines();
  }

  async function toggleRoutine(routine: Routine) {
    const { error } = await supabase
      .from("routines")
      .update({ completed: !routine.completed })
      .eq("id", routine.id);

    if (error) alert("Erro ao atualizar rotina: " + error.message);
    else loadRoutines();
  }

  async function deleteRoutine(id: string) {
    if (!confirm("Queres apagar esta rotina?")) return;

    const { error } = await supabase.from("routines").delete().eq("id", id);
    if (error) alert("Erro ao apagar rotina: " + error.message);
    else loadRoutines();
  }

  const completed = routines.filter((r) => r.completed).length;
  const percentage = routines.length
    ? Math.round((completed / routines.length) * 100)
    : 0;

  return (
    <main className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CONSISTÊNCIA</p>
          <h1>As minhas rotinas</h1>
          <p className="muted">Pequenos hábitos, grandes resultados.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="muted">Rotinas</span>
          <strong>{routines.length}</strong>
        </div>
        <div className="stat-card">
          <span className="muted">Concluídas</span>
          <strong>{completed}</strong>
        </div>
        <div className="stat-card">
          <span className="muted">Progresso</span>
          <strong>{percentage}%</strong>
        </div>
      </div>

      <section className="panel">
        <h2>Nova rotina</h2>
        <form onSubmit={addRoutine} className="form-grid">
          <input
            placeholder="Ex.: Ler 20 minutos"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <button className="primary-button" type="submit">Adicionar rotina</button>
        </form>
      </section>

      <section className="panel">
        <h2>Hábitos a cumprir</h2>
        {loading ? <p className="muted">A carregar...</p> :
          routines.length === 0 ? (
            <p className="empty-state">Ainda não tens rotinas. Cria a primeira!</p>
          ) : (
            <div className="item-list">
              {routines.map((routine) => (
                <article className="task-item" key={routine.id}>
                  <label className="task-main">
                    <input
                      className="task-checkbox"
                      type="checkbox"
                      checked={routine.completed}
                      onChange={() => toggleRoutine(routine)}
                    />
                    <strong className={routine.completed ? "done-text" : ""}>
                      {routine.title}
                    </strong>
                  </label>
                  <button className="danger-button" onClick={() => deleteRoutine(routine.id)}>
                    Apagar
                  </button>
                </article>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}
