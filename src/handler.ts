import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

const store = new Map<string, any>();

function jsonResponse(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
}

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const method = (event.httpMethod || (event.requestContext as any)?.http?.method || "GET").toUpperCase();
  const id = event.pathParameters?.id;

  try {
    if (method === "GET" && id) {
      const item = store.get(id);
      if (!item) {
        return jsonResponse(404, { message: `Item ${id} not found` });
      }
      return jsonResponse(200, item);
    }

    if (method === "POST") {
      if (!event.body) {
        return jsonResponse(400, { message: "Missing request body" });
      }
      let payload: any;
      try {
        payload = JSON.parse(event.body);
      } catch (err) {
        return jsonResponse(400, { message: "Invalid JSON body" });
      }
      const newId = new Date().getTime().toString(); // Simple unique ID generation
      const created = { id: newId, ...payload };
      store.set(newId, created);
      return jsonResponse(201, created);
    }

    if (method === "DELETE") {
      if (!id) {
        return jsonResponse(400, { message: "Missing id in path" });
      }
      const existed = store.delete(id);
      if (!existed) {
        return jsonResponse(404, { message: `Item ${id} not found` });
      }
      return jsonResponse(204, "");
    }

    return jsonResponse(405, { message: `Method ${method} not allowed` });
  } catch (err) {
    console.error("Handler error:", err);
    return jsonResponse(500, { message: "Internal server error" });
  }
};