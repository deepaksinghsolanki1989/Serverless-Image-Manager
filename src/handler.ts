import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handleRoute } from "./routes/image.route";
import { jsonResponse } from "./utils";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log("Received event:", JSON.stringify(event, null,));
    return await handleRoute(event);
  } catch (err: any) {
    console.error("Unhandled error in handler:", err);
    return jsonResponse(500, { message: "Internal Server Error", error: err?.message });
  }
};