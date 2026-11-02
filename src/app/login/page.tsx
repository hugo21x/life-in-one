
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = creating
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else if (creating && !result.data.session) {
      setMessage("Conta criada! Confirma o teu email para ativar o acesso.");
    } else {
      window.location.href = "/";
    }

    setLoading(false);
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0b0e14",
      color: "white",
      display: "grid",
      placeItems: "center",
      padding: "20px"
    }}>
      <form onSubmit={handleSubmit} style={{
        width: "100%",
        maxWidth: "400px",
        background: "#151a23",
        padding: "32px",
        borderRadius: "16px"
      }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
          Life Manager
        </h1>

        <p style={{ color: "#9ca3af", margin: "10px 0 25px" }}>
          {creating ? "Criar a tua conta" : "Entra na tua conta"}
        </p>

        <label>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          placeholder="O teu email"
        />

        <label>Palavra-passe</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          placeholder="Mínimo 6 caracteres"
        />

        <button type="submit" disabled={loading} style={{
          width: "100%",
          padding: "13px",
          background: "#6366f1",
          color: "white",
          border: "none",
          borderRadius: "8px",
          marginTop: "20px",
          cursor: "pointer"
        }}>
          {loading ? "Aguarda..." : creating ? "Criar conta" : "Entrar"}
        </button>

        {message && (
          <p style={{ color: "#fbbf24", marginTop: "15px" }}>
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setCreating(!creating);
            setMessage("");
          }}
          style={{
            color: "#a5b4fc",
            background: "none",
            border: "none",
            marginTop: "20px",
            cursor: "pointer"
          }}
        >
          {creating ? "Já tenho conta — Entrar" : "Criar uma conta nova"}
        </button>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px",
  margin: "8px 0 18px",
  borderRadius: "8px",
  border: "1px solid #374151",
  background: "#0b0e14",
  color: "white"
};
