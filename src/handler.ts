import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import { handleRoute } from "./routes/image.route";
import { jsonResponse } from "./utils";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));
    return await handleRoute(event);
  } catch (err: any) {
    console.error("Unhandled error in handler:", err);
    return jsonResponse(500, { message: "Internal Server Error", error: err?.message });
  }
};