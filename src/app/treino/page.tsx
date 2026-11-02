
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Workout = {
  id: string;
  title: string;
  workout_date: string;
  duration: number | null;
  notes: string | null;
};

export default function WorkoutPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [title, setTitle] = useState("");
  const [workoutDate, setWorkoutDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [duration, setDuration] = useState("45");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadWorkouts() {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .order("workout_date", { ascending: false });

    if (error) alert("Erro ao carregar treinos: " + error.message);
    else setWorkouts((data ?? []) as Workout[]);
    setLoading(false);
  }

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function addWorkout(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert("Inicia sessão novamente.");
      return;
    }

    const { error } = await supabase.from("workouts").insert({
      user_id: userData.user.id,
      title: title.trim(),
      workout_date: workoutDate,
      duration: Number(duration) || 0,
      notes: notes.trim() || null,
    });

    if (error) {
      alert("Erro ao guardar treino: " + error.message);
      return;
    }

    setTitle("");
    setNotes("");
    loadWorkouts();
  }

  async function deleteWorkout(id: string) {
    if (!confirm("Queres apagar este treino?")) return;

    const { error } = await supabase.from("workouts").delete().eq("id", id);
    if (error) alert("Erro ao apagar treino: " + error.message);
    else loadWorkouts();
  }

  const totalMinutes = workouts.reduce(
    (sum, workout) => sum + (workout.duration ?? 0),
    0
  );

  return (
    <main className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ATIVIDADE FÍSICA</p>
          <h1>Treino</h1>
          <p className="muted">Acompanha os teus treinos e a tua consistência.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="muted">Treinos registados</span>
          <strong>{workouts.length}</strong>
        </div>
        <div className="stat-card">
          <span className="muted">Minutos acumulados</span>
          <strong>{totalMinutes}</strong>
        </div>
        <div className="stat-card">
          <span className="muted">Horas acumuladas</span>
          <strong>{(totalMinutes / 60).toFixed(1)}</strong>
        </div>
      </div>

      <section className="panel">
        <h2>Registar treino</h2>
        <form onSubmit={addWorkout} className="form-grid">
          <input
            placeholder="Ex.: Treino de pernas"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label className="field-label">
            Data
            <input
              type="date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              required
            />
          </label>

          <label className="field-label">
            Duração em minutos
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </label>

          <input
            placeholder="Notas (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button className="primary-button" type="submit">Guardar treino</button>
        </form>
      </section>

      <section className="panel">
        <h2>Histórico de treinos</h2>
        {loading ? <p className="muted">A carregar...</p> :
          workouts.length === 0 ? (
            <p className="empty-state">Ainda não tens treinos registados.</p>
          ) : (
            <div className="item-list">
              {workouts.map((workout) => (
                <article className="task-item" key={workout.id}>
                  <div>
                    <strong>{workout.title}</strong>
                    <p className="muted">
                      {workout.workout_date} · {workout.duration ?? 0} minutos
                    </p>
                    {workout.notes && <p className="muted">{workout.notes}</p>}
                  </div>
                  <button className="danger-button" onClick={() => deleteWorkout(workout.id)}>
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
