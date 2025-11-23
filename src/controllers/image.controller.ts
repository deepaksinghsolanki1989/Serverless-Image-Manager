import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { uploadImage, getImage, deleteImage } from "../services/image.service";
import { jsonResponse } from "../utils";


export default class ImageController {
  async uploadImage(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    if (!event.body) {
      return { statusCode: 400, body: "Missing body" };
    }

    const filename =
      event.queryStringParameters?.filename ||
      event.headers["x-filename"] ||
      `upload-${Date.now()}`;

    const contentType = event.headers["content-type"] || event.headers["Content-Type"] || "application/octet-stream";

    // API Gateway sets this flag when the payload is base64-encoded
    const isBase64 = !!event.isBase64Encoded;
    const buffer = Buffer.from(event.body, isBase64 ? "base64" : "utf8");

    const result = await uploadImage({ filename, contentType, buffer });

    const functionUrlPrefix = process.env.FUNCTION_URL || "";
    const url = functionUrlPrefix ? `${functionUrlPrefix}/image/${result.id}` : `/image/${result.id}`;

    return jsonResponse(201, { id: result.id, url });
  }

  async getImage(id: string): Promise<APIGatewayProxyResult> {
    const obj = await getImage(id);
    if (!obj) return jsonResponse(404, { message: "Not found" });

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": obj.contentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${obj.metadata.filename}"`
      },
      body: obj.data.toString("base64")
    };
  }

  async deleteImage(id: string): Promise<APIGatewayProxyResult> {
    const ok = await deleteImage(id);
    if (!ok) return jsonResponse(404, { message: "Not found" });
    return jsonResponse(200, { ok: true });
  }
}

