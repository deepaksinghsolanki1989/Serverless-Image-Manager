import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";

export function getClientIp(event: APIGatewayProxyEventV2): string {
  const xf = event.headers?.["x-forwarded-for"] || event.headers?.["X-Forwarded-For"];
  if (xf) {
    const parts = xf.split(",");
    return parts[0].trim();
  }

  // @ts-ignore
  const sourceIp = event.requestContext?.http?.sourceIp;
  if (sourceIp) return sourceIp;

  return "unknown";
}

export function jsonResponse(status: number, body: any): APIGatewayProxyResult {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

export async function getFunctionUrl(event: APIGatewayProxyEventV2): Promise<string> {
  const host = event.headers?.["host"] || event.headers?.["Host"];
  if (!host) return '';

  const protocol = await getProtocol(event);
  if (protocol === "unknown") return '';

  return `${protocol}://${host}`;
}

export async function getProtocol(event: APIGatewayProxyEventV2): Promise<'https' | 'http' | 'unknown'> {
  const headers = event.headers;

  if (headers) {
    const headerLookup = (key: string) => {
      if (!headers) return undefined;

      const foundKey = Object.keys(headers).find(k => k.toLowerCase() === key.toLowerCase());
      if (!foundKey) return undefined;
      const val = headers[foundKey];

      return Array.isArray(val) ? val[0] : val;
    };

    const proto = headerLookup('x-forwarded-proto') || headerLookup('x-forwarded-protocol') || headerLookup('x-forwarded-scheme');
    if (proto) {
      const p = String(proto).split(',')[0].trim().toLowerCase();
      return p === 'https' ? 'https' : p === 'http' ? 'http' : 'unknown';
    }

    const port = headerLookup('x-forwarded-port') || headerLookup('forwarded-port');
    if (port) {
      const p = String(port).split(',')[0].trim();
      if (p === '443') return 'https';
      if (p === '80') return 'http';
    }
  }

  return 'unknown';
};