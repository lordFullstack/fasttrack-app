import React, { useState } from "react";

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE || "";

export default function App() {
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE);
  const [healthResult, setHealthResult] = useState<string>("");
  const [dbResult, setDbResult] = useState<string>("");
  const [loading, setLoading] = useState<"health" | "db" | null>(null);

  const testHealth = async () => {
    setLoading("health");
    setHealthResult("");
    try {
      const res = await fetch(`${apiBase}/health`);
      const body = await res.text();
      setHealthResult(`HTTP ${res.status}\n${body}`);
    } catch (e) {
      setHealthResult(`FETCH FAILED: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(null);
    }
  };

  const testDb = async () => {
    setLoading("db");
    setDbResult("");
    try {
      const res = await fetch(`${apiBase}/db-ping`);
      const body = await res.text();
      setDbResult(`HTTP ${res.status}\n${body}`);
    } catch (e) {
      setDbResult(`FETCH FAILED: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ fontFamily: "monospace", padding: 24, maxWidth: 640, margin: "0 auto", background: "#1C1A17", color: "#F5F1EA", minHeight: "100vh" }}>
      <h2>FAST TRACK — Esqueleto de conexión</h2>
      <p style={{ color: "#9C948A", fontSize: 13 }}>
        Este panel solo prueba que el backend responde y que puede hablar con Postgres. Nada de lógica de negocio.
      </p>

      <label style={{ display: "block", fontSize: 12, color: "#9C948A", marginTop: 20 }}>URL del backend (Render):</label>
      <input
        value={apiBase}
        onChange={(e) => setApiBase(e.target.value)}
        placeholder="https://tu-servicio.onrender.com"
        style={{ width: "100%", boxSizing: "border-box", padding: 10, marginTop: 4, marginBottom: 16, background: "#26221D", border: "1px solid #33302A", color: "#F5F1EA", borderRadius: 6 }}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={testHealth} disabled={!apiBase || loading !== null} style={btnStyle}>
          {loading === "health" ? "Probando…" : "1. Probar /health"}
        </button>
        <button onClick={testDb} disabled={!apiBase || loading !== null} style={btnStyle}>
          {loading === "db" ? "Probando…" : "2. Probar /db-ping"}
        </button>
      </div>

      {healthResult && (
        <div style={resultStyle(healthResult.startsWith("HTTP 200"))}>
          <strong>/health:</strong>
          <pre style={{ whiteSpace: "pre-wrap", margin: "6px 0 0" }}>{healthResult}</pre>
        </div>
      )}
      {dbResult && (
        <div style={resultStyle(dbResult.startsWith("HTTP 200"))}>
          <strong>/db-ping:</strong>
          <pre style={{ whiteSpace: "pre-wrap", margin: "6px 0 0" }}>{dbResult}</pre>
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  background: "#E8A33D",
  color: "#1C1A17",
  fontWeight: 700,
  cursor: "pointer",
};

function resultStyle(ok: boolean): React.CSSProperties {
  return {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    background: ok ? "#1E2A1D" : "#2A1D1A",
    color: ok ? "#8FBF8A" : "#D98A6E",
    fontSize: 12,
  };
}
