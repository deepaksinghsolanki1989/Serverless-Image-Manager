import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import Busboy from "busboy";

interface OutputFile {
  filename: string;
  buffer: Buffer;
  contentType: string;
  encoding: string;
  fieldname: string;
}

interface ParsedOutput {
  files: OutputFile[];
}

export const parse = async (
  event: APIGatewayProxyEventV2
): Promise<ParsedOutput> => {
  const contentType =
    event.headers["content-type"] ?? event.headers["Content-Type"];

  if (!contentType) {
    return { files: [] };
  }

  const parsed = await parseMultipart(event.body!, contentType);

  return parsed;
};

function parseMultipart(
  body: string,
  contentType: string
): Promise<ParsedOutput> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: { "content-type": contentType } });

    const result: ParsedOutput = {
      files: [],
    };

    busboy.on("file", (fieldname: string, file: any, fileData: {filename: string, encoding: string, mimeType: string}) => {
      const chunks: Buffer[] = [];

      file.on("data", (data: Buffer) => {
        chunks.push(data);
      });

      file.on("end", () => {
        result.files.push({
          filename: fileData.filename,
          buffer: Buffer.concat(chunks),
          contentType: fileData.mimeType,
          encoding: fileData.encoding,
          fieldname
        });
      });
    });

    busboy.on("finish", () => resolve(result));
    busboy.on("error", reject);

    // Decode from base64 (API Gateway sends files encoded)
    const decoded = Buffer.from(body, "base64");
    busboy.end(decoded);
  });
}
