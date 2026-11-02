
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string | null;
  completed: boolean;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Média");
  const [filter, setFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Erro ao carregar tarefas: " + error.message);
    } else {
      setTasks((data ?? []) as Task[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert("Inicia sessão novamente.");
      return;
    }

    const { error } = await supabase.from("tasks").insert({
      user_id: userData.user.id,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      priority,
      completed: false,
    });

    if (error) {
      alert("Erro ao criar tarefa: " + error.message);
      return;
    }

    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("Média");
    loadTasks();
  }

  async function toggleTask(task: Task) {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id);

    if (error) {
      alert("Erro ao atualizar tarefa: " + error.message);
      return;
    }
    loadTasks();
  }

  async function deleteTask(id: string) {
    if (!confirm("Queres apagar esta tarefa?")) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erro ao apagar tarefa: " + error.message);
      return;
    }
    loadTasks();
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description ?? "").toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "Todas" ||
        (filter === "Pendentes" && !task.completed) ||
        (filter === "Concluídas" && task.completed);

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  const pending = tasks.filter((task) => !task.completed).length;
  const completed = tasks.filter((task) => task.completed).length;

  return (
    <main className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ORGANIZAÇÃO</p>
          <h1>As minhas tarefas</h1>
          <p className="muted">Transforma planos em ações concretas.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="muted">Total</span>
          <strong>{tasks.length}</strong>
        </div>
        <div className="stat-card">
          <span className="muted">Pendentes</span>
          <strong>{pending}</strong>
        </div>
        <div className="stat-card">
          <span className="muted">Concluídas</span>
          <strong>{completed}</strong>
        </div>
      </div>

      <section className="panel">
        <h2>Adicionar tarefa</h2>
        <form onSubmit={addTask} className="form-grid">
          <input
            placeholder="O que tens de fazer?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className="field-label">
            Data limite
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
          <label className="field-label">
            Prioridade
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option>Baixa</option>
              <option>Média</option>
              <option>Alta</option>
            </select>
          </label>
          <button className="primary-button" type="submit">Adicionar tarefa</button>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Lista de tarefas</h2>
          <span className="muted">{filteredTasks.length} resultados</span>
        </div>

        <input
          placeholder="Pesquisar tarefas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filter-row">
          {["Todas", "Pendentes", "Concluídas"].map((item) => (
            <button
              key={item}
              className={filter === item ? "filter-button selected" : "filter-button"}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? <p className="muted">A carregar...</p> :
          filteredTasks.length === 0 ? (
            <p className="empty-state">Não foram encontradas tarefas.</p>
          ) : (
            <div className="item-list">
              {filteredTasks.map((task) => (
                <article className="task-item" key={task.id}>
                  <div className="task-main">
                    <input
                      className="task-checkbox"
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                    />
                    <div>
                      <strong className={task.completed ? "done-text" : ""}>
                        {task.title}
                      </strong>
                      {task.description && <p className="muted">{task.description}</p>}
                      <div className="task-meta">
                        <span>{task.due_date ? `Prazo: ${task.due_date}` : "Sem prazo"}</span>
                        <span>Prioridade: {task.priority ?? "Média"}</span>
                      </div>
                    </div>
                  </div>
                  <button className="danger-button" onClick={() => deleteTask(task.id)}>
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
