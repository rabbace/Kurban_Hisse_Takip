import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { OrderStatus } from "@/lib/types";
import { SMS } from "@/lib/sms";
import { WhatsApp } from "@/lib/whatsapp";
import { formatDateTime } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const body = await req.json();
  const { order_id, status, note, appointment_datetime } = body as {
    order_id: string;
    status: OrderStatus;
    note?: string;
    appointment_datetime?: string;
  };

  if (!order_id || !status) {
    return NextResponse.json({ error: "order_id ve status zorunlu." }, { status: 400 });
  }

  // Fetch order with customer and animal
  const { data: order } = await supabase
    .from("orders")
    .select("*, customers(*), animals(*)")
    .eq("id", order_id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }

  const updates: Record<string, unknown> = { status };
  if (appointment_datetime) updates.appointment_datetime = appointment_datetime;
  if (status === "kesim_basladi") updates.slaughter_started_at = new Date().toISOString();
  if (status === "kesildi") updates.slaughter_completed_at = new Date().toISOString();

  await supabase.from("orders").update(updates).eq("id", order_id);

  await supabase.from("slaughter_logs").insert({
    order_id,
    status,
    note: note?.trim() || null,
  });

  // Send SMS
  const phone = order.customers?.phone;
  const name = order.customers?.full_name || "";
  const code = order.tracking_code;

  if (phone) {
    const appt = appointment_datetime
      ? formatDateTime(appointment_datetime)
      : order.appointment_datetime
      ? formatDateTime(order.appointment_datetime)
      : null;

    switch (status) {
      case "onaylandi":
        SMS.onaylandi(phone, name, appt).catch(() => {});
        WhatsApp.onaylandi(phone, name, appt).catch(() => {});
        break;
      case "kesim_basladi":
        SMS.kesimBasladi(phone, name, code).catch(() => {});
        WhatsApp.kesimBasladi(phone, name, code).catch(() => {});
        break;
      case "kesildi":
        SMS.kesildi(phone, name, order.delivery_type).catch(() => {});
        WhatsApp.kesildi(phone, name, order.delivery_type).catch(() => {});
        break;
      case "teslim_edildi":
        SMS.teslimEdildi(phone, name).catch(() => {});
        WhatsApp.teslimEdildi(phone, name).catch(() => {});
        break;
    }
  }

  return NextResponse.json({ success: true });
}
