
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Event = {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  async function loadEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      alert("Não foi possível carregar os eventos: " + error.message);
    } else {
      setEvents((data ?? []) as Event[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !eventDate) return;

    const { error } = await supabase.from("events").insert({
      title,
      description,
      event_date: eventDate,
      event_time: eventTime || null,
    });

    if (error) {
      alert("Erro ao guardar evento: " + error.message);
      return;
    }

    setTitle("");
    setDescription("");
    setEventDate("");
    setEventTime("");
    await loadEvents();
  }

  async function deleteEvent(id: number) {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erro ao apagar evento: " + error.message);
      return;
    }

    await loadEvents();
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // A semana começa à segunda-feira
  const offset = (firstDay + 6) % 7;

  const calendarDays = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthName = currentDate.toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
  });

  function dateString(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const selectedEvents = events.filter(
    (event) => event.event_date === selectedDate
  );

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0b0f17",
      color: "white",
      padding: "30px",
      fontFamily: "Arial, sans-serif",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "30px" }}>Calendário</h1>
        <p style={{ color: "#9ca3af" }}>
          Organiza os teus compromissos e marcações.
        </p>

        <section style={{
          background: "#151c29",
          padding: "22px",
          borderRadius: "14px",
          border: "1px solid #263244",
          marginTop: "25px",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}>
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              ← Anterior
            </button>

            <h2 style={{ textTransform: "capitalize", textAlign: "center" }}>
              {monthName}
            </h2>

            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
              Seguinte →
            </button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: "6px",
          }}>
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
              <div key={day} style={{
                textAlign: "center",
                color: "#9ca3af",
                fontWeight: "bold",
                padding: "8px 0",
                fontSize: "13px",
              }}>
                {day}
              </div>
            ))}

            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} />;
              }

              const date = dateString(day);
              const dayEvents = events.filter(
                (event) => event.event_date === date
              );
              const isSelected = selectedDate === date;
              const isToday = todayString === date;

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    minHeight: "75px",
                    padding: "8px 2px",
                    borderRadius: "9px",
                    border: isSelected
                      ? "2px solid #60a5fa"
                      : isToday
                        ? "1px solid #60a5fa"
                        : "1px solid #263244",
                    background: isSelected ? "#263b59" : "#0f1724",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <strong>{day}</strong>
                  {dayEvents.length > 0 && (
                    <span style={{
                      fontSize: "11px",
                      color: "#93c5fd",
                    }}>
                      {dayEvents.length} evento(s)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section style={{
          background: "#151c29",
          padding: "22px",
          borderRadius: "14px",
          marginTop: "22px",
          border: "1px solid #263244",
        }}>
          <h2>Adicionar evento</h2>

          <form onSubmit={addEvent} style={{
            display: "grid",
            gap: "12px",
          }}>
            <input
              placeholder="Nome do evento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <input
              placeholder="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />

            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />

            <button type="submit">Guardar evento</button>
          </form>
        </section>

        <section style={{
          background: "#151c29",
          padding: "22px",
          borderRadius: "14px",
          marginTop: "22px",
          border: "1px solid #263244",
        }}>
          <h2>
            {selectedDate
              ? `Eventos de ${selectedDate}`
              : "Seleciona um dia no calendário"}
          </h2>

          {loading ? (
            <p>A carregar eventos...</p>
          ) : selectedDate && selectedEvents.length === 0 ? (
            <p style={{ color: "#9ca3af" }}>Não existem eventos neste dia.</p>
          ) : (
            selectedEvents.map((event) => (
              <div key={event.id} style={{
                padding: "14px",
                marginTop: "10px",
                background: "#0f1724",
                borderRadius: "9px",
              }}>
                <strong>{event.title}</strong>
                <p style={{ color: "#9ca3af" }}>
                  {event.description}
                </p>
                <p style={{ color: "#93c5fd" }}>
                  {event.event_time || "Sem hora definida"}
                </p>
                <button onClick={() => deleteEvent(event.id)}>
                  Apagar
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
