import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { parse } from "lambda-multipart-parser";
import { uploadImage, getImage, deleteImage } from "../services/image.service";
import { jsonResponse } from "../utils";


export default class ImageController {
  async uploadImage(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    if (!event.body) {
      return { statusCode: 400, body: "Missing body" };
    }

    const uploadedFiles = await parse(event);

    if (uploadedFiles.files.length === 0) {
      return { statusCode: 400, body: "No file uploaded" };
    }

    const functionUrlPrefix = process.env.FUNCTION_URL || "";

    const resultFiles = await Promise.all(
      uploadedFiles.files.map(async (file) => {
        const { filename, content: buffer, contentType } = file;

        const result = await uploadImage({ filename, contentType, buffer });
        const url = functionUrlPrefix ? `${functionUrlPrefix}/${result.id}` : `/${result.id}`;

        return { id: result.id, url };
      })
    );

    return jsonResponse(201, {images: resultFiles});
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

