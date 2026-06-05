const NETGSM_URL = "https://api.netgsm.com.tr/sms/send/get/";

function cleanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "90" + digits.slice(1);
  if (digits.startsWith("90")) return digits;
  return "90" + digits;
}

async function sendSMS(phone: string, message: string): Promise<boolean> {
  const user = process.env.NETGSM_USER;
  const pass = process.env.NETGSM_PASS;
  const header = process.env.NETGSM_HEADER || "KURBAN";

  if (!user || !pass) {
    // SMS credentials not configured — log and skip gracefully
    console.log(`[SMS SKIP] To: ${phone}\n${message}`);
    return true;
  }

  try {
    const params = new URLSearchParams({
      usercode: user,
      password: pass,
      gsmno: cleanPhone(phone),
      text: message,
      msgheader: header,
    });
    const res = await fetch(`${NETGSM_URL}?${params}`);
    const body = await res.text();
    const ok = body.startsWith("00") || body.startsWith("01") || body.startsWith("02");
    if (!ok) console.error(`[SMS ERROR] ${body}`);
    return ok;
  } catch (err) {
    console.error("[SMS ERROR]", err);
    return false;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const SMS = {
  siparisAlindi: (phone: string, name: string, code: string) =>
    sendSMS(
      phone,
      `Sayin ${name}, kurban siparisiz alindi. Takip kodu: ${code}. Durum takibi: ${BASE_URL}/takip/${code}`
    ),

  onaylandi: (phone: string, name: string, appointment: string | null) =>
    sendSMS(
      phone,
      appointment
        ? `Sayin ${name}, siparisiz onaylandi. Randevu: ${appointment}. Sorulariniz icin bizi arayin.`
        : `Sayin ${name}, kurban siparisiz onaylandi. Yakin zamanda size randevu bilgisi iletecegiz.`
    ),

  kesimBasladi: (phone: string, name: string, code: string) =>
    sendSMS(
      phone,
      `Sayin ${name}, hayvaninizin kesimi basliyor. Durumu takip etmek icin: ${BASE_URL}/takip/${code}`
    ),

  kesildi: (phone: string, name: string, delivery: string) => {
    const deliveryMsg =
      delivery === "paket_et"
        ? "Etinizi teslim almak icin lutfen bizimle iletisime gecin."
        : delivery === "yerinde_kesim"
        ? "Etiniz adresinize teslim edilecektir."
        : "Etiniz firmamizda muhafaza edilmektedir.";
    return sendSMS(phone, `Sayin ${name}, kurbaniniz kesildi. ${deliveryMsg}`);
  },

  teslimEdildi: (phone: string, name: string) =>
    sendSMS(phone, `Sayin ${name}, kurbaniniz teslim edildi. Hayirli Kurban Bayrami!`),
};
