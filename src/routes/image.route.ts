import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import ImageController from "../controllers/image.controller";
import { isRateLimited } from "../services/rate-limiter.service";
import { getClientIp, jsonResponse } from "../utils";


export async function handleRoute(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> {
  const clientIp = getClientIp(event);
  console.log("Client IP:", clientIp);
  if (isRateLimited(clientIp)) {
    return jsonResponse(429, { message: "Too many requests" });
  }

  const method = ((event.requestContext as any)?.http?.method || "GET").toUpperCase();
  const path = event.rawPath || "/";
  const id = path.split("/")[1];

  console.log(`Received ${method} request for image with id: ${id || "N/A"} from IP: ${clientIp}`, JSON.stringify(event, null, 2));
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