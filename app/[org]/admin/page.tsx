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
  const isLedger = org.style === "ledger";

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

  const propList = properties ?? [];
  const chargeList = charges ?? [];
  const occupied = propList.filter((p) => p.tenants && p.tenants.length > 0).length;
  const pendingCount = chargeList.filter((c) => c.status === "pendiente").length;
  const pendingTotal = chargeList
    .filter((c) => c.status === "pendiente")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const panelStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: "var(--org-radius)",
    border: isLedger ? "1px solid #E4DFD3" : "none",
    boxShadow: isLedger ? "none" : "0 6px 20px rgba(20,35,43,0.06)",
    overflow: "hidden",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: "var(--org-font)",
    color: "var(--org-ink)",
    fontSize: 17,
    fontWeight: isLedger ? 400 : 800,
    letterSpacing: isLedger ? "0.02em" : "normal",
    marginBottom: 10,
    marginTop: 0,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 11px",
    border: "1px solid #E4DFD3",
    borderRadius: isLedger ? 4 : 8,
    fontSize: 13,
  };

  const primaryBtnStyle: React.CSSProperties = {
    width: "100%",
    background: "#1F2421",
    color: "#fff",
    border: "none",
    borderRadius: isLedger ? 4 : 8,
    padding: "11px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "var(--org-font)", fontSize: 22, color: "var(--org-ink)", fontWeight: isLedger ? 400 : 800 }}>
            Panel de administración
          </div>
          <div style={{ fontSize: 12.5, color: "#5B6259", marginTop: 2 }}>
            Gestioná tus propiedades e inquilinos
          </div>
        </div>
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

      {/* Resumen */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 28,
        }}
      >
        {[
          { label: "Propiedades", value: propList.length },
          { label: "Ocupadas", value: `${occupied}/${propList.length}` },
          { label: "Cargos pendientes", value: pendingCount, sub: pendingCount > 0 ? money(pendingTotal) : undefined },
        ].map((k, i) => (
          <div key={i} style={{ ...panelStyle, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--org-ink)" }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "#5B6259", marginTop: 2 }}>{k.label}</div>
            {k.sub && <div style={{ fontSize: 11, color: "var(--org-accent)", marginTop: 2, fontWeight: 600 }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Propiedades */}
      <h2 style={sectionTitleStyle}>Propiedades</h2>
      <div style={{ ...panelStyle, marginBottom: 16 }}>
        {propList.length === 0 && (
          <div style={{ padding: "24px 16px", textAlign: "center", color: "#5B6259", fontSize: 13 }}>
            Todavía no cargaste ninguna propiedad.
          </div>
        )}
        {propList.map((p, i) => (
          <div
            key={p.id}
            style={{
              padding: "15px 18px",
              borderTop: i === 0 ? "none" : "1px solid #EFEBE2",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, color: "var(--org-ink)", fontSize: 14 }}>
                  {p.address} {p.unit ? `· ${p.unit}` : ""}
                </div>
                <div style={{ fontSize: 12, color: "#5B6259", marginTop: 2 }}>{p.tenants?.[0]?.name ?? "Vacante"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 13, color: "var(--org-ink)" }}>
                  {p.tenants?.[0]?.rent_amount ? money(p.tenants[0].rent_amount) : "—"}
                </div>
                <details>
                  <summary style={{ cursor: "pointer", fontSize: 18, color: "#B5AEA0", listStyle: "none" }}>⋯</summary>
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6, minWidth: 210 }}>
                    <form action={updateProperty} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <input type="hidden" name="subdomain" value={subdomain} />
                      <input type="hidden" name="id" value={p.id} />
                      <input name="address" defaultValue={p.address} style={{ ...inputStyle, padding: "7px 9px", fontSize: 12 }} />
                      <input name="unit" defaultValue={p.unit ?? ""} placeholder="Unidad" style={{ ...inputStyle, padding: "7px 9px", fontSize: 12 }} />
                      <button type="submit" style={{ ...primaryBtnStyle, padding: "7px 10px", fontSize: 12 }}>
                        Guardar cambios
                      </button>
                    </form>
                    <form action={deleteProperty}>
                      <input type="hidden" name="subdomain" value={subdomain} />
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        style={{ width: "100%", background: "#fff", color: "#C23B22", border: "1px solid #C23B22", borderRadius: isLedger ? 4 : 8, padding: "7px 10px", fontSize: 12, cursor: "pointer" }}
                      >
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

      <form action={addProperty} style={{ ...panelStyle, display: "flex", flexDirection: "column", gap: 8, padding: 14, marginBottom: 30 }}>
        <input type="hidden" name="subdomain" value={subdomain} />
        <input name="address" placeholder="Dirección" required style={inputStyle} />
        <input name="unit" placeholder="Unidad (opcional)" style={inputStyle} />
        <button type="submit" style={primaryBtnStyle}>
          Agregar propiedad
        </button>
      </form>

      {/* Cargos especiales */}
      <h2 style={sectionTitleStyle}>Cargos especiales</h2>
      <div style={{ ...panelStyle, marginBottom: 16 }}>
        {chargeList.length === 0 && (
          <div style={{ padding: "24px 16px", textAlign: "center", color: "#5B6259", fontSize: 13 }}>
            Todavía no cargaste ningún cargo especial.
          </div>
        )}
        {chargeList.map((c, i) => (
          <div
            key={c.id}
            style={{
              padding: "15px 18px",
              borderTop: i === 0 ? "none" : "1px solid #EFEBE2",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, color: "var(--org-ink)", fontSize: 14 }}>{c.concept}</div>
                <div style={{ fontSize: 12, color: "#5B6259", marginTop: 2 }}>{c.tenants?.name ?? "Sin inquilino asignado"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, color: "var(--org-ink)" }}>{money(Number(c.amount))}</div>
                  <div
                    style={{
                      fontSize: 10.5,
                      marginTop: 3,
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 999,
                      color: "#fff",
                      background: c.status === "pendiente" ? "#C23B22" : c.status === "pagado" ? "#2E8B6E" : "#8A8377",
                    }}
                  >
                    {c.status}
                  </div>
                </div>
                <details>
                  <summary style={{ cursor: "pointer", fontSize: 18, color: "#B5AEA0", listStyle: "none" }}>⋯</summary>
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6, minWidth: 210 }}>
                    <form action={updateCharge} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <input type="hidden" name="subdomain" value={subdomain} />
                      <input type="hidden" name="id" value={c.id} />
                      <input name="concept" defaultValue={c.concept} style={{ ...inputStyle, padding: "7px 9px", fontSize: 12 }} />
                      <input name="amount" type="number" step="0.01" defaultValue={c.amount} style={{ ...inputStyle, padding: "7px 9px", fontSize: 12 }} />
                      <button type="submit" style={{ ...primaryBtnStyle, padding: "7px 10px", fontSize: 12 }}>
                        Guardar cambios
                      </button>
                    </form>
                    <form action={deleteCharge}>
                      <input type="hidden" name="subdomain" value={subdomain} />
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        style={{ width: "100%", background: "#fff", color: "#C23B22", border: "1px solid #C23B22", borderRadius: isLedger ? 4 : 8, padding: "7px 10px", fontSize: 12, cursor: "pointer" }}
                      >
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

      <form action={addCharge} style={{ ...panelStyle, display: "flex", flexDirection: "column", gap: 8, padding: 14 }}>
        <input type="hidden" name="subdomain" value={subdomain} />
        <input name="concept" placeholder="Concepto (ej. Interés por mora)" required style={inputStyle} />
        <input name="amount" type="number" inputMode="decimal" step="0.01" min="0" placeholder="Monto (ej. 15000)" required style={inputStyle} />
        <button type="submit" style={primaryBtnStyle}>
          Agregar cargo
        </button>
      </form>
    </div>
  );
}
