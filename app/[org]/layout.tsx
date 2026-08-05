import { getOrgBySubdomain, themeVars } from "@/lib/getOrg";
import { notFound } from "next/navigation";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org: subdomain } = await params;
  const org = await getOrgBySubdomain(subdomain);

  if (!org) notFound();

  return (
    <div style={{ ...themeVars(org), minHeight: "100vh", background: "#F7F4EE", fontFamily: "var(--org-font)" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 20px" }}>
        {org.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={org.logo_url} alt={org.name} style={{ height: 36 }} />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--org-radius)",
              background: "var(--org-ink)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            {org.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <span style={{ fontWeight: 700, color: "var(--org-ink)" }}>{org.name}</span>
      </header>
      <main style={{ padding: "0 20px 40px" }}>{children}</main>
    </div>
  );
}
