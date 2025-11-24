import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import ImageController from "../controllers/image.controller";
import { isRateLimited } from "../services/rate-limiter.service";
import { getClientIp, jsonResponse } from "../utils";


export async function handleRoute(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const clientIp = getClientIp(event);

  if (isRateLimited(clientIp)) {
    return jsonResponse(429, { message: "Too many requests" });
  }

  const method = ((event.requestContext as any)?.http?.method || (event.requestContext as any)?.httpMethod || "").toUpperCase();

  if(!["GET", "POST", "DELETE"].includes(method)) {
    return jsonResponse(405, { message: "Method Not Allowed" });
  }

  const path = (event as any).rawPath || "/";
  const id = path.split("/")[1];

  const imageController = new ImageController();

  if (method === "POST") {
    return await imageController.uploadImage(event);
  } else if (method === "GET") {
    if (!id) return jsonResponse(400, { message: "Missing image id" });
    return await imageController.getImage(id);
  } else if (method === "DELETE") {
    if (!id) return jsonResponse(400, { message: "Missing image id" });
    return await imageController.deleteImage(id);
  }

  return jsonResponse(404, { message: "Not Found" });
}