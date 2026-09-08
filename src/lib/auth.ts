import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "jr-lingeries-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type Session = {
  id: string;
  role: "PATROA" | "CLIENTE";
  exp: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não configurado.");
  return secret;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) return false;

  try {
    const derived = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

function encodeSession(session: Session) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function decodeSession(value: string): Session | null {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
    if (!session.id || !session.role || session.exp <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export async function createSession(id: bigint, role: Session["role"]) {
  const cookieStore = await cookies();
  const session: Session = {
    id: id.toString(),
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };

  cookieStore.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  return value ? decodeSession(value) : null;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
