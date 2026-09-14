import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function parseProductId(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return null;
  return BigInt(value);
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "CLIENTE") {
    return NextResponse.json({ authenticated: false, favorite: false, ids: [] });
  }

  const productId = parseProductId(new URL(request.url).searchParams.get("productId"));
  const userId = BigInt(session.id);

  if (productId !== null) {
    const favorite = await prisma.favorites.findUnique({
      where: { user_id_product_id: { user_id: userId, product_id: productId } },
      select: { id: true },
    });
    return NextResponse.json({ authenticated: true, favorite: Boolean(favorite) });
  }

  const favorites = await prisma.favorites.findMany({
    where: { user_id: userId },
    select: { product_id: true },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({
    authenticated: true,
    favorite: false,
    ids: favorites.map((favorite) => favorite.product_id.toString()),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "CLIENTE") {
    return NextResponse.json({ error: "Faça login para adicionar favoritos." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const productId = parseProductId(body?.productId ? String(body.productId) : null);
  if (productId === null) {
    return NextResponse.json({ error: "Produto inválido." }, { status: 400 });
  }

  const product = await prisma.products.findFirst({ where: { id: productId, active: true }, select: { id: true } });
  if (!product) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });

  await prisma.favorites.upsert({
    where: { user_id_product_id: { user_id: BigInt(session.id), product_id: productId } },
    create: { user_id: BigInt(session.id), product_id: productId },
    update: {},
  });

  return NextResponse.json({ favorite: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "CLIENTE") {
    return NextResponse.json({ error: "Faça login para gerenciar favoritos." }, { status: 401 });
  }

  const productId = parseProductId(new URL(request.url).searchParams.get("productId"));
  if (productId === null) return NextResponse.json({ error: "Produto inválido." }, { status: 400 });

  await prisma.favorites.deleteMany({
    where: { user_id: BigInt(session.id), product_id: productId },
  });

  return NextResponse.json({ favorite: false });
}
