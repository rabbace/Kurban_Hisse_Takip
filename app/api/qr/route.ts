import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get("data");
  if (!data) {
    return new NextResponse("data param required", { status: 400 });
  }

  const png = await QRCode.toBuffer(data, {
    type: "png",
    width: 200,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return new NextResponse(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
