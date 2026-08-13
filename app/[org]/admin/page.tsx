import { supabaseServer } from "@/lib/supabaseServer";
import { getOrgBySubdomain } from "@/lib/getOrg";
import { redirect } from "next/navigation";
import { logout, addProperty, addCharge } from "./actions";

function money(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export default async function AdminPage({ params }: { params: Promise<{ org: string }> }) {
  const { org: subdomain } = await params;
  const org = await getOrgBySubdomain(subdomain);
  if (!org) return <p>Organización no encontrada.</p>;

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${subdomain}/login`);
  }

  // Gracias a RLS, esto solo trae datos de la org del admin autenticado
  const { data: properties } = await supabase
    .from("properties")
    .select("*, tenants(name, rent_amount)")
    .eq("organization_id", org.id);

  const { data: charges } = await supabase
    .from("charges")
    .select("*, tenants(name)")
    .eq("organization_id", org.id)
    .order("due_date", { ascending: true });

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <form action={logout}>
          <input type="hidden" name="subdomain" value={subdomain} />
          <button
            type="submit"
            style={{
              background: "none",
              border: "1px solid #E4DFD3",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              color: "#5B6259",
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      <h2 style={{ fontFamily: "var(--org-font)", color: "var(--org-ink)" }}>Propiedades</h2>
      <div style={{ background: "#fff", borderRadius: "var(--org-radius)", border: "1px solid #E4DFD3", overflow: "hidden", marginBottom: 24 }}>
        {(properties ?? []).map((p, i) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "13px 16px",
              borderTop: i === 0 ? "none" : "1px solid #E4DFD3",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: "var(--org-ink)" }}>
                {p.address} {p.unit ? `· ${p.unit}` : ""}
              </div>
              <div style={{ fontSize: 12, color: "#5B6259" }}>{p.tenants?.[0]?.name ?? "Vacante"}</div>
            </div>
            <div>{p.tenants?.[0]?.rent_amount ? money(p.tenants[0].rent_amount) : "—"}</div>
          </div>
        ))}
      </div>

      <form
        action={addProperty}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 24,
          background: "#fff",
          border: "1px solid #E4DFD3",
          borderRadius: "var(--org-radius)",
          padding: 12,
        }}
      >
        <input type="hidden" name="subdomain" value={subdomain} />
        <input
          name="address"
          placeholder="Dirección"
          required
          style={{ flex: "1 1 140px", minWidth: 0, padding: "8px 10px", border: "1px solid #E4DFD3", borderRadius: 6, fontSize: 13 }}
        />
        <input
          name="unit"
          placeholder="Unidad (opcional)"
          style={{ flex: "1 1 100px", minWidth: 0, padding: "8px 10px", border: "1px solid #E4DFD3", borderRadius: 6, fontSize: 13 }}
        />
        <button
          type="submit"
          style={{ flex: "0 0 auto", background: "var(--org-ink)", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}
        >
          Agregar
        </button>
      </form>

      <h2 style={{ fontFamily: "var(--org-font)", color: "var(--org-ink)" }}>Cargos especiales</h2>
      <div style={{ background: "#fff", borderRadius: "var(--org-radius)", border: "1px solid #E4DFD3", overflow: "hidden" }}>
        {(charges ?? []).map((c, i) => (
          <div
            key={c.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "13px 16px",
              borderTop: i === 0 ? "none" : "1px solid #E4DFD3",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: "var(--org-ink)" }}>{c.concept}</div>
              <div style={{ fontSize: 12, color: "#5B6259" }}>{c.tenants?.name}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div>{money(Number(c.amount))}</div>
              <div style={{ fontSize: 11, color: "#5B6259" }}>{c.status}</div>
            </div>
          </div>
        ))}
      </div>

      <form
        action={addCharge}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 12,
          background: "#fff",
          border: "1px solid #E4DFD3",
          borderRadius: "var(--org-radius)",
          padding: 12,
        }}
      >
        <input type="hidden" name="subdomain" value={subdomain} />
        <input
          name="concept"
          placeholder="Concepto (ej. Interés por mora)"
          required
          style={{ flex: "1 1 160px", minWidth: 0, padding: "8px 10px", border: "1px solid #E4DFD3", borderRadius: 6, fontSize: 13 }}
        />
        <input
          name="amount"
          type="number"
          step="0.01"
          placeholder="Monto"
          required
          style={{ flex: "1 1 90px", minWidth: 0, padding: "8px 10px", border: "1px solid #E4DFD3", borderRadius: 6, fontSize: 13 }}
        />
        <button
          type="submit"
          style={{ flex: "0 0 auto", background: "var(--org-ink)", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}
        >
          Agregar
        </button>
      </form>
    </div>
  );
}
