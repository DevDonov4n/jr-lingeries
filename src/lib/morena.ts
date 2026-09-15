const MORENA_BASE_URL = "https://www.morenalingerie.com.br";
const PROCESS_URL = `${MORENA_BASE_URL}/PDF/PROCESSAPDF.ASP`;

type MorenaSession = {
  cookie: string;
  catalogUrl: string;
};

export type MorenaProductReference = {
  sku: string;
  imageUrl: string;
};

function extractCookies(headers: Headers) {
  const withGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };
  const cookies = withGetSetCookie.getSetCookie?.() ?? [];

  if (cookies.length > 0) {
    return cookies.map((value) => value.split(";", 1)[0]).join("; ");
  }

  const single = headers.get("set-cookie");
  return single ? single.split(/,(?=[^;,]+=)/).map((value) => value.split(";", 1)[0]).join("; ") : "";
}

async function startMorenaSession(cpf: string, pedido: string): Promise<MorenaSession> {
  const body = new URLSearchParams({
    CPF: cpf,
    PEDIDO: pedido,
    // PROCESSAPDF.ASP is submitted by an image button on the original page.
    // These coordinates reproduce the request observed in Chrome DevTools.
    x: "29",
    y: "14",
  });

  const response = await fetch(PROCESS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0 (compatible; JR-Lingeries/1.0)",
    },
    body,
    redirect: "manual",
    cache: "no-store",
  });

  if (response.status !== 302 && response.status !== 303) {
    throw new Error(`A Morena recusou a consulta (HTTP ${response.status}).`);
  }

  const location = response.headers.get("location");
  if (!location) throw new Error("A Morena não retornou o endereço do catálogo.");

  const cookie = extractCookies(response.headers);
  const catalogUrl = new URL(location, PROCESS_URL).toString();

  return { cookie, catalogUrl };
}

export async function fetchMorenaPedido(cpf: string, pedido: string) {
  const session = await startMorenaSession(cpf, pedido);

  const response = await fetch(session.catalogUrl, {
    method: "GET",
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0 (compatible; JR-Lingeries/1.0)",
      ...(session.cookie ? { Cookie: session.cookie } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Não foi possível abrir o catálogo da Morena (HTTP ${response.status}).`);
  }

  const html = await response.text();
  const products = extractProductReferences(html);

  if (products.length === 0) {
    throw new Error("A consulta foi aceita, mas nenhum produto foi encontrado no catálogo.");
  }

  return {
    pedido,
    total: products.length,
    products,
  };
}

function extractProductReferences(html: string): MorenaProductReference[] {
  const matches = html.matchAll(/<img[^>]+src=["']([^"']*\/tags\/([0-9]+)\.png)["'][^>]*>/gi);
  const seen = new Set<string>();
  const products: MorenaProductReference[] = [];

  for (const match of matches) {
    const relativeUrl = match[1];
    const sku = match[2];
    if (seen.has(sku)) continue;
    seen.add(sku);

    products.push({
      sku,
      imageUrl: new URL(relativeUrl, `${MORENA_BASE_URL}/pdf/`).toString(),
    });
  }

  return products;
}
