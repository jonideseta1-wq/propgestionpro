"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { getOrgBySubdomain } from "@/lib/getOrg";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function logout(formData: FormData) {
  const subdomain = formData.get("subdomain") as string;
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect(`/${subdomain}/login`);
}

export async function addProperty(formData: FormData) {
  const subdomain = formData.get("subdomain") as string;
  const address = formData.get("address") as string;
  const unit = formData.get("unit") as string;

  const org = await getOrgBySubdomain(subdomain);
  if (!org) return;

  const supabase = await supabaseServer();
  await supabase.from("properties").insert({
    organization_id: org.id,
    address,
    unit: unit || null,
  });

  revalidatePath(`/${subdomain}/admin`);
}

export async function addCharge(formData: FormData) {
  const subdomain = formData.get("subdomain") as string;
  const concept = formData.get("concept") as string;
  const amount = Number(formData.get("amount"));

  const org = await getOrgBySubdomain(subdomain);
  if (!org) return;

  const supabase = await supabaseServer();
  await supabase.from("charges").insert({
    organization_id: org.id,
    concept,
    amount,
    status: "pendiente",
  });

  revalidatePath(`/${subdomain}/admin`);
}
