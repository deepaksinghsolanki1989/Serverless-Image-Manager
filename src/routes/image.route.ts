import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import ImageController from "../controllers/image.controller";
import { isRateLimited } from "../services/rate-limiter.service";
import { getClientIp, jsonResponse } from "../utils";


export async function handleRoute(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const clientIp = getClientIp(event);
  if (isRateLimited(clientIp)) {
    return jsonResponse(429, { message: "Too many requests" });
  }

  const method = (event.httpMethod || (event.requestContext as any)?.http?.method || "GET").toUpperCase();
  const id = event.pathParameters?.id;

  const imageController = new ImageController();

  if (method === "POST") {
    return await imageController.uploadImage(event);
  }

  if (method === "GET") {
    if (!id) return jsonResponse(400, { message: "Missing image id" });
    return await imageController.getImage(id);
  }

  if (method === "DELETE") {
    if (!id) return jsonResponse(400, { message: "Missing image id" });
    return await imageController.deleteImage(id);
  }

  return jsonResponse(404, { message: "Not Found" });
}