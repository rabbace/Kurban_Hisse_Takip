import type { NextApiRequest, NextApiResponse } from "next";
import QRCode from "qrcode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data } = req.query;
  if (!data || typeof data !== "string") {
    return res.status(400).send("data param required");
  }

  const png = await QRCode.toBuffer(data, {
    type: "png",
    width: 200,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(png);
}
