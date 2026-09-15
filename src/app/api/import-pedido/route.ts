import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fetchMorenaPedido } from "@/lib/morena";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATROA") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { cpf?: string; pedido?: string };
    const cpf = body.cpf?.trim();
    const pedido = body.pedido?.trim();

    if (!cpf || !pedido) {
      return NextResponse.json(
        { error: "Informe o CPF e o número do pedido." },
        { status: 400 },
      );
    }

    if (!/^\d{11}$/.test(cpf.replace(/\D/g, ""))) {
      return NextResponse.json(
        { error: "Informe um CPF válido com 11 dígitos." },
        { status: 400 },
      );
    }

    if (!/^\d+$/.test(pedido)) {
      return NextResponse.json(
        { error: "O número do pedido deve conter apenas números." },
        { status: 400 },
      );
    }

    const result = await fetchMorenaPedido(cpf, pedido);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[import-pedido]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível consultar o pedido na Morena Lingerie.",
      },
      { status: 502 },
    );
  }
}
