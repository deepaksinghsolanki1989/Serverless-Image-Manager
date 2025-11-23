import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import { uploadImage, getImage, deleteImage } from "../services/image.service";
import { jsonResponse } from "../utils";


export default class ImageController {
  async uploadImage(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> {
    return jsonResponse(200, { ok: true });
  }

  async getImage(id: string): Promise<APIGatewayProxyResult> {
    return jsonResponse(200, { ok: true });
  }

  async deleteImage(id: string): Promise<APIGatewayProxyResult> {
    const ok = await deleteImage(id);
    if (!ok) return jsonResponse(404, { message: "Not found" });
    return jsonResponse(200, { ok: true });
  }
}

