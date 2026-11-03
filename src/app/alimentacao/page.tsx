
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Meal = {
  id: string;
  name: string;
  meal_type: string;
  meal_date: string;
  notes: string | null;
};

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState("Almoço");
  const [mealDate, setMealDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    setMealDate(`${year}-${month}-${day}`);
  }, []);

  async function loadMeals() {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .order("meal_date", { ascending: false });

    if (error) alert("Erro ao carregar refeições: " + error.message);
    else setMeals((data ?? []) as Meal[]);

    setLoading(false);
  }

  useEffect(() => {
    loadMeals();
  }, []);

  async function addMeal(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !mealDate) return;

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Inicia sessão novamente.");
      return;
    }

    const { error } = await supabase.from("meals").insert({
      user_id: userData.user.id,
      name: name.trim(),
      meal_type: mealType,
      meal_date: mealDate,
      notes: notes.trim() || null,
    });

    if (error) {
      alert("Erro ao guardar refeição: " + error.message);
      return;
    }

    setName("");
    setNotes("");
    loadMeals();
  }

  async function deleteMeal(id: string) {
    if (!confirm("Queres apagar esta refeição?")) return;

    const { error } = await supabase
      .from("meals")
      .delete()
      .eq("id", id);

    if (error) alert("Erro ao apagar refeição: " + error.message);
    else loadMeals();
  }

  const today = mealDate;
  const todayMeals = meals.filter(
    (meal) => meal.meal_date === today
  );

  return (
    <main className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">BEM-ESTAR</p>
          <h1>Alimentação</h1>
          <p className="muted">
            Regista e organiza as tuas refeições.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="muted">Refeições registadas</span>
          <strong>{meals.length}</strong>
        </div>

        <div className="stat-card">
          <span className="muted">Refeições de hoje</span>
          <strong>{todayMeals.length}</strong>
        </div>
      </div>

      <section className="panel">
        <h2>Registar refeição</h2>

        <form onSubmit={addMeal} className="form-grid">
          <input
            placeholder="Ex.: Frango com arroz"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="field-label">
            Tipo de refeição
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option>Pequeno-almoço</option>
              <option>Lanche da manhã</option>
              <option>Almoço</option>
              <option>Lanche</option>
              <option>Jantar</option>
              <option>Ceia</option>
            </select>
          </label>

          <label className="field-label">
            Data
            <input
              type="date"
              value={mealDate}
              onChange={(e) => setMealDate(e.target.value)}
              required
            />
          </label>

          <input
            placeholder="Notas ou ingredientes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            className="primary-button"
            type="submit"
            disabled={!mealDate}
          >
            Guardar refeição
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Histórico de refeições</h2>

        {loading ? (
          <p className="muted">A carregar...</p>
        ) : meals.length === 0 ? (
          <p className="empty-state">
            Ainda não tens refeições registadas.
          </p>
        ) : (
          <div className="item-list">
            {meals.map((meal) => (
              <article className="task-item" key={meal.id}>
                <div>
                  <strong>{meal.name}</strong>
                  <p className="muted">
                    {meal.meal_type} · {meal.meal_date}
                  </p>
                  {meal.notes && (
                    <p className="muted">{meal.notes}</p>
                  )}
                </div>

                <button
                  className="danger-button"
                  onClick={() => deleteMeal(meal.id)}
                >
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
