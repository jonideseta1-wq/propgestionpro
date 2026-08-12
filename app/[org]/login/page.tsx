"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams<{ org: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    router.push(`/${params.org}/admin`);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px 16px" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#fff",
          borderRadius: "var(--org-radius, 8px)",
          border: "1px solid #E4DFD3",
          padding: 32,
        }}
      >
        <div style={{ fontSize: 15, color: "var(--org-ink, #1F2421)", marginBottom: 20, fontWeight: 700 }}>
          Iniciar sesión
        </div>

        <label style={{ fontSize: 12, color: "#5B6259", display: "block", marginBottom: 4 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 12px",
            marginBottom: 14,
            border: "1px solid #E4DFD3",
            borderRadius: 6,
            fontSize: 14,
          }}
        />

        <label style={{ fontSize: 12, color: "#5B6259", display: "block", marginBottom: 4 }}>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 12px",
            marginBottom: 20,
            border: "1px solid #E4DFD3",
            borderRadius: 6,
            fontSize: 14,
          }}
        />

        {error && <div style={{ color: "#C23B22", fontSize: 13, marginBottom: 14 }}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: 6,
            background: "var(--org-ink, #1F2421)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
