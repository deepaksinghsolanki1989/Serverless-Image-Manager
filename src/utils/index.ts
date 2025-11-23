import { APIGatewayProxyResult } from "aws-lambda";

export function jsonResponse(status: number, body: any): APIGatewayProxyResult {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}