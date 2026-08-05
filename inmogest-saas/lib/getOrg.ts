import { supabaseServer } from "./supabase";

export type Org = {
  id: string;
  name: string;
  subdomain: string;
  logo_url: string | null;
  color_primary: string;
  color_accent: string;
  display_font: "serif" | "sans";
  style: "ledger" | "card";
};

// Busca la organización por subdominio (delta.tuplataforma.com -> "delta")
export async function getOrgBySubdomain(subdomain: string): Promise<Org | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("subdomain", subdomain)
    .single();

  if (error || !data) return null;
  return data as Org;
}

// Deriva las variables CSS de marca a partir de los datos de la organización
export function themeVars(org: Org) {
  return {
    "--org-ink": org.color_primary,
    "--org-accent": org.color_accent,
    "--org-font": org.display_font === "serif" ? "Georgia, 'Times New Roman', serif" : "system-ui, sans-serif",
    "--org-radius": org.style === "ledger" ? "2px" : "16px",
  } as React.CSSProperties;
}
