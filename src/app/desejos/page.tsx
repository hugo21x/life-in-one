
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Wish = {
  id: string;
  title: string;
  price: number | null;
  purchased: boolean;
  notes: string | null;
};

export default function WishlistPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadWishes() {
    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) alert("Erro ao carregar desejos: " + error.message);
    else setWishes((data ?? []) as Wish[]);
    setLoading(false);
  }

  useEffect(() => {
    loadWishes();
  }, []);

  async function addWish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert("Inicia sessão novamente.");
      return;
    }

    const { error } = await supabase.from("wishlist").insert({
      user_id: userData.user.id,
      title: title.trim(),
      price: price ? Number(price) : null,
      purchased: false,
      notes: notes.trim() || null,
    });

    if (error) {
      alert("Erro ao guardar desejo: " + error.message);
      return;
    }

    setTitle("");
    setPrice("");
    setNotes("");
    loadWishes();
  }

  async function toggleWish(wish: Wish) {
    const { error } = await supabase
      .from("wishlist")
      .update({ purchased: !wish.purchased })
      .eq("id", wish.id);

    if (error) alert("Erro ao atualizar desejo: " + error.message);
    else loadWishes();
  }

  async function deleteWish(id: string) {
    if (!confirm("Queres apagar este desejo?")) return;

    const { error } = await supabase.from("wishlist").delete().eq("id", id);
    if (error) alert("Erro ao apagar desejo: " + error.message);
    else loadWishes();
  }

  const totalValue = wishes
    .filter((wish) => !wish.purchased)
    .reduce((sum, wish) => sum + (wish.price ?? 0), 0);

  return (
    <main className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">INSPIRAÇÃO</p>
          <h1>Lista de desejos</h1>
          <p className="muted">Guarda aquilo que gostarias de adquirir.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="muted">Desejos guardados</span>
          <strong>{wishes.length}</strong>
        </div>
        <div className="stat-card">
          <span className="muted">Já adquiridos</span>
          <strong>{wishes.filter((w) => w.purchased).length}</strong>
        </div>
        <div className="stat-card">
          <span className="muted">Valor por adquirir</span>
          <strong>{totalValue.toLocaleString("pt-PT", {
            style: "currency",
            currency: "EUR",
          })}</strong>
        </div>
      </div>

      <section className="panel">
        <h2>Adicionar desejo</h2>
        <form onSubmit={addWish} className="form-grid">
          <input
            placeholder="O que gostarias de comprar?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <label className="field-label">
            Preço estimado (€)
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <input
            placeholder="Notas ou link (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button className="primary-button" type="submit">Guardar desejo</button>
        </form>
      </section>

      <section className="panel">
        <h2>Os meus desejos</h2>
        {loading ? <p className="muted">A carregar...</p> :
          wishes.length === 0 ? (
            <p className="empty-state">Ainda não tens desejos guardados.</p>
          ) : (
            <div className="item-list">
              {wishes.map((wish) => (
                <article className="task-item" key={wish.id}>
                  <div className="task-main">
                    <input
                      className="task-checkbox"
                      type="checkbox"
                      checked={wish.purchased}
                      onChange={() => toggleWish(wish)}
                    />
                    <div>
                      <strong className={wish.purchased ? "done-text" : ""}>
                        {wish.title}
                      </strong>
                      <p className="muted">
                        {wish.price !== null
                          ? wish.price.toLocaleString("pt-PT", {
                              style: "currency",
                              currency: "EUR",
                            })
                          : "Sem preço definido"}
                      </p>
                      {wish.notes && <p className="muted">{wish.notes}</p>}
                    </div>
                  </div>
                  <button className="danger-button" onClick={() => deleteWish(wish.id)}>
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
