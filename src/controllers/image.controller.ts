import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import { uploadImage, getImage, deleteImage } from "../services/image.service";
import { getFunctionUrl, jsonResponse } from "../utils";
import { parse } from "../services/lambda-multipart-parser.service";
import fs from "fs";

export default class ImageController {
  async uploadImage(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResult> {
    if (!event.body) {
      return { statusCode: 400, body: "Missing body" };
    }

    const uploadedFiles = await parse(event);

    if (uploadedFiles.files.length === 0) {
      return { statusCode: 400, body: "No file uploaded" };
    }

    const functionUrlPrefix = await getFunctionUrl(event);

    const resultFiles = await Promise.all(
      uploadedFiles.files.map(async (file) => {
        const { filename, buffer, contentType } = file;

        const result = await uploadImage({
          filename: `${filename}-${Date.now()}`,
          contentType,
          buffer,
        });

        return { id: result.id, url: `${functionUrlPrefix}/image/${result.id}` };
      })
    );

    return jsonResponse(201, { images: resultFiles });
  }

  async getImage(id: string): Promise<APIGatewayProxyResult> {
    const obj = await getImage(id);
    if (!obj) return jsonResponse(404, { message: "Not found" });

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": obj.contentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${obj.metadata.filename}"`,
      },
      body: obj.data.toString("base64"),
    };
  }

  async deleteImage(id: string): Promise<APIGatewayProxyResult> {
    const ok = await deleteImage(id);
    if (!ok) return jsonResponse(404, { message: "Not found" });
    return jsonResponse(200, { ok: true });
  }
}
