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

function getCookieNames(cookieHeader: string) {
  return cookieHeader
    .split(";")
    .map((part) => part.split("=", 1)[0].trim())
    .filter(Boolean);
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
  const pageResponse = await fetch(PDF_PAGE_URL, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0 (compatible; JR-Lingeries/1.0)",
    },
    cache: "no-store",
  });

  console.log("[Morena] GET /pdf/ status:", pageResponse.status);
  console.log("[Morena] GET /pdf/ possui Set-Cookie:", Boolean(pageResponse.headers.get("set-cookie")));

  if (!pageResponse.ok) {
    throw new Error(`Não foi possível iniciar a sessão da Morena (HTTP ${pageResponse.status}).`);
  }

  let cookie = extractCookies(pageResponse.headers);
  console.log("[Morena] GET /pdf/ possui cookie extraído:", Boolean(cookie));
  console.log("[Morena] GET /pdf/ nomes dos cookies:", getCookieNames(cookie).join(", ") || "(nenhum)");

  const cpfFormatado = cpf.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    "$1.$2.$3-$4",
  );

  const body = new URLSearchParams({
    CPF: cpfFormatado,
    PEDIDO: pedido,
    x: "21",
    y: "6",
  });

  console.log("[Morena] POST URL:", PROCESS_URL);
  console.log("[Morena] POST Content-Type: application/x-www-form-urlencoded");
  console.log("[Morena] POST Referer:", PDF_PAGE_URL);
  console.log("[Morena] POST Origin:", MORENA_BASE_URL);
  console.log("[Morena] CPF enviado: caracteres:", cpfFormatado.length, "formatado:", /\D/.test(cpfFormatado));
  console.log("[Morena] Pedido enviado: caracteres:", pedido.length);

  const response = await fetch(PROCESS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36",
      Referer: PDF_PAGE_URL,
      Origin: MORENA_BASE_URL,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const postLocation = response.headers.get("location");
  const postStatus = response.status;
  const hadSessionCookie = Boolean(cookie);

  console.log("[Morena] Status POST:", postStatus);
  console.log("[Morena] Location do POST:", postLocation ?? "(não informado)");
  console.log("[Morena] Possui cookie de sessão:", hadSessionCookie);

  cookie = mergeCookies(cookie, extractCookies(response.headers));

  if (response.status !== 302 && response.status !== 303) {
    throw new Error(`A Morena recusou a consulta (HTTP ${response.status}).`);
  }

  if (!postLocation) {
    throw new Error("A Morena não retornou o endereço do catálogo.");
  }

  const catalogUrl = new URL(postLocation, PROCESS_URL);

  console.log("[Morena] URL do catálogo:", catalogUrl.toString());

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

  if (response.url.toLowerCase().includes("/pdf/indisponivel.asp")) {
    throw new Error(
      "A Morena não disponibilizou este pedido. Verifique se o CPF e o número do pedido estão corretos e se o pedido já está disponível para consulta.",
    );
  }

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
