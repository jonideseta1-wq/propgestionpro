import { supabaseServer } from "@/lib/supabaseServer";
import { getOrgBySubdomain } from "@/lib/getOrg";
import { redirect } from "next/navigation";
import { logout, addProperty, updateProperty, deleteProperty, addCharge, updateCharge, deleteCharge } from "./actions";

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
              padding: "13px 16px",
              borderTop: i === 0 ? "none" : "1px solid #E4DFD3",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, color: "var(--org-ink)" }}>
                  {p.address} {p.unit ? `· ${p.unit}` : ""}
                </div>
                <div style={{ fontSize: 12, color: "#5B6259" }}>{p.tenants?.[0]?.name ?? "Vacante"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div>{p.tenants?.[0]?.rent_amount ? money(p.tenants[0].rent_amount) : "—"}</div>
                <details>
                  <summary style={{ cursor: "pointer", fontSize: 16, color: "#5B6259", listStyle: "none" }}>⋯</summary>
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8, minWidth: 200 }}>
                    <form action={updateProperty} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <input type="hidden" name="subdomain" value={subdomain} />
                      <input type="hidden" name="id" value={p.id} />
                      <input name="address" defaultValue={p.address} style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", border: "1px solid #E4DFD3", borderRadius: 6, fontSize: 12 }} />
                      <input name="unit" defaultValue={p.unit ?? ""} placeholder="Unidad" style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", border: "1px solid #E4DFD3", borderRadius: 6, fontSize: 12 }} />
                      <button type="submit" style={{ background: "#1F2421", color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
                        Guardar cambios
                      </button>
                    </form>
                    <form action={deleteProperty}>
                      <input type="hidden" name="subdomain" value={subdomain} />
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" style={{ width: "100%", background: "#fff", color: "#C23B22", border: "1px solid #C23B22", borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
                        Eliminar propiedad
                      </button>
                    </form>
                  </div>
                </details>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        action={addProperty}
        style={{
          display: "flex",
          flexDirection: "column",
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
          style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", border: "1px solid #E4DFD3", borderRadius: 6, fontSize: 13 }}
        />
        <input
          name="unit"
          placeholder="Unidad (opcional)"
          style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", border: "1px solid #E4DFD3", borderRadius: 6, fontSize: 13 }}
        />
        <button
          type="submit"
          style={{ width: "100%", background: "#1F2421", color: "#fff", border: "none", borderRadius: 6, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Agregar propiedad
        </button>
      </form>

      <h2 style={{ fontFamily: "var(--org-font)", color: "var(--org-ink)" }}>Cargos especiales</h2>
      <div style={{ background: "#fff", borderRadius: "var(--org-radius)", border: "1px solid #E4DFD3", overflow: "hidden" }}>
        {(charges ?? []).map((c, i) => (
          <div
            key={c.id}
            style={{
              padding: "13px 16px",
              borderTop: i === 0 ? "none" : "1px solid #E4DFD3",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, color: "var(--org-ink)" }}>{c.concept}</div>
                <div style={{ fontSize: 12, color: "#5B6259" }}>{c.tenants?.name}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ textAlign: "right" }}>
                  <div>{money(Number(c.amount))}</div>
                  <div style={{ fontSize: 11, color: "#5B6259" }}>{c.status}</div>
                </div>
                <details>
                  <summary style={{ cursor: "pointer", fontSize: 16, color: "#5B6259", listStyle: "none" }}>⋯</summary>
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8, minWidth: 200 }}>
                    <form action={updateCharge} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <input type="hidden" name="subdomain" value={subdomain} />
                      <input type="hidden" name="id" value={c.id} />
                      <input name="concept" defaultValue={c.concept} style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", border: "1px solid #E4DFD3", borderRadius: 6, fontSize: 12 }} />
                      <input name="amount" type="number" step="0.01" defaultValue={c.amount} style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", border: "1px solid #E4DFD3", borderRadius: 6, fontSize: 12 }} />
                      <button type="submit" style={{ background: "#1F2421", color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
                        Guardar cambios
                      </button>
                    </form>
                    <form action={deleteCharge}>
                      <input type="hidden" name="subdomain" value={subdomain} />
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" style={{ width: "100%", background: "#fff", color: "#C23B22", border: "1px solid #C23B22", borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
                        Eliminar cargo
                      </button>
                    </form>
                  </div>
                </details>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        action={addCharge}
        style={{
          display: "flex",
          flexDirection: "column",
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
          style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", border: "1px solid #E4DFD3", borderRadius: 6, fontSize: 13 }}
        />
        <input
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="Monto (ej. 15000)"
          required
          style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", border: "1px solid #E4DFD3", borderRadius: 6, fontSize: 13 }}
        />
        <button
          type="submit"
          style={{ width: "100%", background: "#1F2421", color: "#fff", border: "none", borderRadius: 6, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Agregar cargo
        </button>
      </form>
    </div>
  );
}
