import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import ImageController from "../controllers/image.controller";
import { jsonResponse } from "../utils";


export async function handleRoute(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> {
  const method = event.requestContext?.http?.method || "";
  const path = event.rawPath || "/";

  const imageController = new ImageController();

  if (method === "POST" && path === "/upload") {
    return await imageController.uploadImage(event);
  }

  if (method === "GET" && path.startsWith("/image/")) {
    const id = path.split("/")[2];
    if (!id) return jsonResponse(400, { message: "Missing image id" });
    return await imageController.getImage(id);
  }

  if (method === "DELETE" && path.startsWith("/image/")) {
    const id = path.split("/")[2];
    if (!id) return jsonResponse(400, { message: "Missing image id" });
    return await imageController.deleteImage(id);
  }

  return jsonResponse(404, { message: "Not Found" });
}