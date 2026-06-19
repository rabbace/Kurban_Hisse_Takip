import { cleanPhone } from "./utils";

const WHATSAPP_API_VERSION = "v21.0";

// WhatsApp Cloud API only allows free-form text within 24h of the customer's
// last message; outside that window (which is always true for our
// business-initiated order updates) the message must use a pre-approved
// template. Template names below must exist (and be approved) in the
// connected Meta Business Account with a matching number of body variables.
async function sendWhatsAppTemplate(
  phone: string,
  templateName: string,
  params: string[]
): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.log(`[WHATSAPP SKIP] To: ${phone}, Template: ${templateName}, Params: ${params.join(" | ")}`);
    return true;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanPhone(phone),
          type: "template",
          template: {
            name: templateName,
            language: { code: "tr" },
            components: [
              {
                type: "body",
                parameters: params.map((text) => ({ type: "text", text })),
              },
            ],
          },
        }),
      }
    );
    const body = await res.json();
    if (!res.ok) {
      console.error("[WHATSAPP ERROR]", JSON.stringify(body));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[WHATSAPP ERROR]", err);
    return false;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const WhatsApp = {
  siparisAlindi: (phone: string, name: string, code: string) =>
    sendWhatsAppTemplate(phone, "siparis_alindi", [name, code, `${BASE_URL}/takip/${code}`]),

  onaylandi: (phone: string, name: string, appointment: string | null) =>
    sendWhatsAppTemplate(phone, "siparis_onaylandi", [
      name,
      appointment
        ? `Randevu: ${appointment}.`
        : "Yakın zamanda size randevu bilgisi iletilecektir.",
    ]),

  kesimBasladi: (phone: string, name: string, code: string) =>
    sendWhatsAppTemplate(phone, "kesim_basladi", [name, `${BASE_URL}/takip/${code}`]),

  kesildi: (phone: string, name: string, delivery: string) => {
    const deliveryMsg =
      delivery === "paket_et"
        ? "Etinizi teslim almak için lütfen bizimle iletişime geçin."
        : delivery === "yerinde_kesim"
        ? "Etiniz adresinize teslim edilecektir."
        : "Etiniz firmamızda muhafaza edilmektedir.";
    return sendWhatsAppTemplate(phone, "kesildi", [name, deliveryMsg]);
  },

  teslimEdildi: (phone: string, name: string) =>
    sendWhatsAppTemplate(phone, "teslim_edildi", [name]),
};
