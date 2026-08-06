import { getOrgBySubdomain, themeVars } from "@/lib/getOrg";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org: subdomain } = await params;
  const org = await getOrgBySubdomain(subdomain);

  if (!org) {
    return (
      <div style={{ padding: 40, fontFamily: "monospace", fontSize: 13 }}>
        <p>DEBUG: no se encontró organización para subdominio: "{subdomain}"</p>
        <p>SUPABASE_URL configurada: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "sí" : "NO"}</p>
        <p>SUPABASE_URL valor: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p>ANON_KEY configurada: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "sí (largo: " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ")" : "NO"}</p>
      </div>
    );
  }

  return (
    <div style={{ ...themeVars(org), minHeight: "100vh", background: "#F7F4EE", fontFamily: "var(--org-font)" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 20px" }}>
        <span style={{ fontWeight: 700, color: "var(--org-ink)" }}>{org.name}</span>
      </header>
      <main style={{ padding: "0 20px 40px" }}>{children}</main>
    </div>
  );
}
