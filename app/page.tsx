import { supabaseServer } from "@/lib/supabaseServer";
import { getOrgBySubdomain } from "@/lib/getOrg";

function money(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export default async function PortalPage({ params }: { params: Promise<{ org: string }> }) {
  const { org: subdomain } = await params;
  const org = await getOrgBySubdomain(subdomain);
  const supabase = await supabaseServer();

  // El inquilino autenticado ve solo su propia fila (protegido por RLS)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>Iniciá sesión para ver tu resumen.</p>;
  }

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, properties(address, unit)")
    .eq("user_id", user.id)
    .single();

  if (!tenant) {
    return <p>No encontramos tu cuenta de inquilino en {org?.name}.</p>;
  }

  const { data: charges } = await supabase
    .from("charges")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("due_date", { ascending: true });

  const total = (charges ?? []).reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--org-radius)",
          border: "1px solid #E4DFD3",
          padding: 22,
        }}
      >
        <div style={{ fontSize: 12, color: "#5B6259", marginBottom: 6 }}>Resumen del mes</div>
        <div style={{ fontFamily: "var(--org-font)", fontSize: 28, color: "var(--org-ink)", marginBottom: 14 }}>
          {money(total)}
        </div>
        <div style={{ borderTop: "1px solid #E4DFD3", paddingTop: 12 }}>
          {(charges ?? []).map((c) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13.5 }}>
              <span style={{ color: "#5B6259" }}>{c.concept}</span>
              <span style={{ color: "var(--org-ink)", fontWeight: 600 }}>{money(Number(c.amount))}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#5B6259", marginTop: 14 }}>
          {tenant.properties?.address} · {tenant.properties?.unit}
        </div>
        <button
          style={{
            marginTop: 16,
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "var(--org-radius)",
            background: "var(--org-accent)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Pagar con Mercado Pago
        </button>
      </div>
    </div>
  );
}
