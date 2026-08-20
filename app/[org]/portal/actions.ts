"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Preference } from "mercadopago";
import { supabaseServer } from "@/lib/supabaseServer";
import { mercadoPagoClient } from "@/lib/mercadopago";

export async function createCheckout(formData: FormData) {
  const subdomain = formData.get("subdomain") as string;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${subdomain}/login`);

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("user_id", user!.id)
    .single();
  if (!tenant) redirect(`/${subdomain}/portal`);

  const { data: charges } = await supabase
    .from("charges")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("status", "pendiente");

  const pending = charges ?? [];
  if (pending.length === 0) redirect(`/${subdomain}/portal`);

  let config;
  try {
    config = mercadoPagoClient();
  } catch {
    redirect(`/${subdomain}/portal?mp_error=not_configured`);
  }

  const h = await headers();
  const host = h.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const preference = new Preference(config);
  const result = await preference.create({
    body: {
      items: pending.map((c) => ({
        id: c.id,
        title: c.concept,
        quantity: 1,
        currency_id: "ARS",
        unit_price: Number(c.amount),
      })),
      payer: { name: tenant.name, email: tenant.email ?? undefined },
      external_reference: pending.map((c) => c.id).join(","),
      back_urls: {
        success: `${baseUrl}/${subdomain}/portal`,
        pending: `${baseUrl}/${subdomain}/portal`,
        failure: `${baseUrl}/${subdomain}/portal`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
    },
  });

  redirect(result.init_point!);
}
