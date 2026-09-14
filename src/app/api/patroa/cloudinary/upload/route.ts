import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

function sign(params: Record<string, string>) {
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!secret) throw new Error("CLOUDINARY_API_SECRET não configurado.");

  const serialized = Object.entries(params)
    .filter(([, value]) => value !== "" && value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${serialized}${secret}`).digest("hex");
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATROA") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary não configurado no ambiente." }, { status: 500 });
  }

  const body = await request.formData();
  const file = body.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Selecione uma imagem." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "O arquivo precisa ser uma imagem." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "A imagem deve ter no máximo 5 MB." }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "jr-lingeries/produtos";
  const publicId = `${Date.now()}-${randomBytes(5).toString("hex")}`;
  const signature = sign({ folder, public_id: publicId, timestamp });

  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("api_key", apiKey);
  uploadData.append("timestamp", timestamp);
  uploadData.append("folder", folder);
  uploadData.append("public_id", publicId);
  uploadData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: uploadData,
  });

  const result = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: result?.error?.message ?? "Falha no upload da imagem." }, { status: 502 });
  }

  return NextResponse.json({
    url: result.secure_url as string,
    publicId: result.public_id as string,
  });
}
