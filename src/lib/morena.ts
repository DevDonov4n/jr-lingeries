const MORENA_BASE_URL = "https://www.morenalingerie.com.br";
const PDF_PAGE_URL = `${MORENA_BASE_URL}/pdf/`;
const PROCESS_URL = `${MORENA_BASE_URL}/PDF/PROCESSAPDF.ASP`;

type MorenaSession = {
  cookie: string;
  catalogUrl: string;
  cadastroId: string | null;
};

export type MorenaProductReference = {
  sku: string;
  imageUrl: string;
};

function extractCookies(headers: Headers) {
  const withGetSetCookie = headers as Headers & { getSetCookie?: () => string[] };
  const cookies = withGetSetCookie.getSetCookie?.() ?? [];
  if (cookies.length > 0) {
    return cookies.map((value) => value.split(";", 1)[0]).join("; ");
  }

  const single = headers.get("set-cookie");
  return single
    ? single.split(/,(?=[^;,]+=)/).map((value) => value.split(";", 1)[0]).join("; ")
    : "";
}

function mergeCookies(...cookieHeaders: string[]) {
  const cookies = new Map<string, string>();
  for (const header of cookieHeaders) {
    for (const part of header.split(";")) {
      const separator = part.indexOf("=");
      if (separator <= 0) continue;
      cookies.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
    }
  }
  return [...cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function startMorenaSession(cpf: string, pedido: string): Promise<MorenaSession> {
  // The browser flow starts on /pdf/ and keeps the ASPSESSIONID for the POST
  // and the following gerapdf.asp request.
  const pageResponse = await fetch(PDF_PAGE_URL, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0 (compatible; JR-Lingeries/1.0)",
    },
    cache: "no-store",
  });

  if (!pageResponse.ok) {
    throw new Error(`Não foi possível iniciar a sessão da Morena (HTTP ${pageResponse.status}).`);
  }

  let cookie = extractCookies(pageResponse.headers);
  const body = new URLSearchParams({ CPF: cpf, PEDIDO: pedido, x: "29", y: "14" });

  const response = await fetch(PROCESS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0 (compatible; JR-Lingeries/1.0)",
      Referer: PDF_PAGE_URL,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body,
    redirect: "manual",
    cache: "no-store",
  });

  cookie = mergeCookies(cookie, extractCookies(response.headers));

  if (response.status !== 302 && response.status !== 303) {
    throw new Error(`A Morena recusou a consulta (HTTP ${response.status}).`);
  }

  const location = response.headers.get("location");
  if (!location) throw new Error("A Morena não retornou o endereço do catálogo.");

  const catalogUrl = new URL(location, PROCESS_URL);
  return {
    cookie,
    catalogUrl: catalogUrl.toString(),
    cadastroId: catalogUrl.searchParams.get("c"),
  };
}

export async function fetchMorenaPedido(cpf: string, pedido: string) {
  const session = await startMorenaSession(cpf, pedido);
  const response = await fetch(session.catalogUrl, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0 (compatible; JR-Lingeries/1.0)",
      Referer: PROCESS_URL,
      ...(session.cookie ? { Cookie: session.cookie } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Não foi possível abrir o catálogo da Morena (HTTP ${response.status}).`);
  }

  const html = await response.text();

  console.log("[Morena] Status catálogo:", response.status);
  console.log("[Morena] URL final:", response.url);
  console.log("[Morena] Tamanho do HTML:", html.length);
  console.log("[Morena] Contém /tags/:", html.includes("/tags/"));
  console.log("[Morena] Primeiros 1000 caracteres:", html.slice(0, 1000));

  const products = extractProductReferences(html);

  console.log(
    "[Morena] Referências encontradas:",
    products.map((product) => product.sku),
  );

  if (products.length === 0) {
    throw new Error("A consulta foi aceita, mas nenhum produto foi encontrado no catálogo.");
  }

  return {
    pedido,
    cadastroId: session.cadastroId,
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
