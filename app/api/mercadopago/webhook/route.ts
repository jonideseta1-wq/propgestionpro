import { NextRequest, NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { mercadoPagoClient } from "@/lib/mercadopago";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const paymentId = body?.data?.id ?? new URL(request.url).searchParams.get("data.id");

  if (!paymentId) {
    return NextResponse.json({ received: true });
  }

  let config;
  try {
    config = mercadoPagoClient();
  } catch {
    return NextResponse.json({ error: "Mercado Pago no está configurado" }, { status: 500 });
  }

  const payment = new Payment(config);
  const info = await payment.get({ id: paymentId });

  if (info.status !== "approved") {
    return NextResponse.json({ received: true });
  }

  const chargeIds = (info.external_reference ?? "").split(",").filter(Boolean);
  if (chargeIds.length === 0) {
    return NextResponse.json({ received: true });
  }

  const supabase = supabaseAdmin();
  const amountPerCharge = Number(info.transaction_amount) / chargeIds.length;

  await supabase.from("charges").update({ status: "pagado" }).in("id", chargeIds);

  await supabase.from("payments").insert(
    chargeIds.map((chargeId) => ({
      charge_id: chargeId,
      amount: amountPerCharge,
      method: "mercado_pago",
    }))
  );

  return NextResponse.json({ received: true });
}
