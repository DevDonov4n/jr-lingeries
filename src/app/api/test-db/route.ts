import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.products.findMany();

    return NextResponse.json({
      success: true,
      count: products.length,
      products: products.map((product) =>
        Object.fromEntries(
          Object.entries(product).map(([key, value]) => [
            key,
            typeof value === "bigint" ? Number(value) : value,
          ])
        )
      ),
    });
  } catch (error) {
    console.error("❌ ERRO DO PRISMA:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}