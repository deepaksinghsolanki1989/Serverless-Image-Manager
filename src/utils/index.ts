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