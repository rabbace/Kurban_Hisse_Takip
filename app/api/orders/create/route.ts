import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { generateTrackingCode } from "@/lib/utils";
import { SMS } from "@/lib/sms";
import { DeliveryType } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      animal_id,
      share_count,
      full_name,
      phone,
      email,
      tc_no,
      address,
      delivery_type,
      appointment_datetime,
      notes,
    } = body;

    if (!animal_id || !full_name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Zorunlu alanlar eksik." }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Fetch animal and check availability
    const { data: animal } = await supabase
      .from("animals")
      .select("*")
      .eq("id", animal_id)
      .single();

    if (!animal) {
      return NextResponse.json({ error: "Hayvan bulunamadı." }, { status: 404 });
    }
    if (animal.available_shares < share_count) {
      return NextResponse.json({ error: "Yeterli hisse mevcut değil." }, { status: 409 });
    }

    const code = generateTrackingCode();
    const total_price = animal.price_per_share * share_count;

    // Create customer (customers table only allows public INSERT, not SELECT,
    // so we generate the id ourselves instead of reading the row back).
    const customerId = crypto.randomUUID();
    const { error: custErr } = await supabase.from("customers").insert({
      id: customerId,
      full_name: full_name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      tc_no: tc_no?.trim() || null,
      address: address?.trim() || null,
    });

    if (custErr) {
      return NextResponse.json({ error: "Müşteri kaydı oluşturulamadı." }, { status: 500 });
    }

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        tracking_code: code,
        customer_id: customerId,
        animal_id,
        share_count,
        order_type: animal.total_shares > 1 ? "hisse" : "tam_hayvan",
        total_price,
        status: "beklemede",
        delivery_type: delivery_type as DeliveryType,
        appointment_datetime: appointment_datetime || null,
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Sipariş oluşturulamadı." }, { status: 500 });
    }

    // Decrement available shares
    await supabase
      .from("animals")
      .update({ available_shares: animal.available_shares - share_count })
      .eq("id", animal_id);

    // Log
    await supabase.from("slaughter_logs").insert({
      order_id: order.id,
      status: "beklemede",
      note: "Sipariş oluşturuldu.",
    });

    // Send SMS (fire and forget)
    SMS.siparisAlindi(phone.trim(), full_name.trim(), code).catch(() => {});

    return NextResponse.json({ tracking_code: code });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
