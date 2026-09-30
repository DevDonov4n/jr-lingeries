import { NextResponse } from "next/server";
import mariadb from "mariadb";

export async function GET() {
  let connection;

  try {
    connection = await mariadb.createConnection({
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT ?? 3306),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: {
        rejectUnauthorized: false,
      },
      connectTimeout: 10000,
    });

    const rows = await connection.query("SELECT 1 AS result");

    return NextResponse.json({
      success: true,
      result: rows[0]?.result ?? null,
    });
  } catch (error) {
    console.error("❌ ERRO DIRETO DO MARIADB:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
