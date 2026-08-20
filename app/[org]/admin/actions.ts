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

export async function updateProperty(formData: FormData) {
  const subdomain = formData.get("subdomain") as string;
  const id = formData.get("id") as string;
  const address = formData.get("address") as string;
  const unit = formData.get("unit") as string;

  const supabase = await supabaseServer();
  await supabase
    .from("properties")
    .update({ address, unit: unit || null })
    .eq("id", id);

  revalidatePath(`/${subdomain}/admin`);
}

export async function deleteProperty(formData: FormData) {
  const subdomain = formData.get("subdomain") as string;
  const id = formData.get("id") as string;

  const supabase = await supabaseServer();
  await supabase.from("properties").delete().eq("id", id);

  revalidatePath(`/${subdomain}/admin`);
}

export async function addTenant(formData: FormData) {
  const subdomain = formData.get("subdomain") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const rent_amount = Number(formData.get("rent_amount")) || 0;
  const property_id = (formData.get("property_id") as string) || null;

  const org = await getOrgBySubdomain(subdomain);
  if (!org) return;

  const supabase = await supabaseServer();
  await supabase.from("tenants").insert({
    organization_id: org.id,
    property_id,
    name,
    email: email || null,
    phone: phone || null,
    rent_amount,
  });

  revalidatePath(`/${subdomain}/admin`);
}

export async function updateTenant(formData: FormData) {
  const subdomain = formData.get("subdomain") as string;
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const rent_amount = Number(formData.get("rent_amount")) || 0;
  const property_id = (formData.get("property_id") as string) || null;

  const supabase = await supabaseServer();
  await supabase
    .from("tenants")
    .update({ name, email: email || null, phone: phone || null, rent_amount, property_id })
    .eq("id", id);

  revalidatePath(`/${subdomain}/admin`);
}

export async function deleteTenant(formData: FormData) {
  const subdomain = formData.get("subdomain") as string;
  const id = formData.get("id") as string;

  const supabase = await supabaseServer();
  await supabase.from("tenants").delete().eq("id", id);

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

export async function updateCharge(formData: FormData) {
  const subdomain = formData.get("subdomain") as string;
  const id = formData.get("id") as string;
  const concept = formData.get("concept") as string;
  const amount = Number(formData.get("amount"));

  const supabase = await supabaseServer();
  await supabase
    .from("charges")
    .update({ concept, amount })
    .eq("id", id);

  revalidatePath(`/${subdomain}/admin`);
}

export async function deleteCharge(formData: FormData) {
  const subdomain = formData.get("subdomain") as string;
  const id = formData.get("id") as string;

  const supabase = await supabaseServer();
  await supabase.from("charges").delete().eq("id", id);

  revalidatePath(`/${subdomain}/admin`);
}
