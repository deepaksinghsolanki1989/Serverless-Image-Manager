import { APIGatewayProxyResult } from "aws-lambda";
import { handler } from "../handler";
import { uploadEvent } from "./api.event";

describe("handler (APIGatewayProxyEvent v1)", () => {
  // ---------- POST / (upload) ----------
  it("POST / → uploads image and returns 201 with id + url", async () => {
    const result = (await handler(uploadEvent)) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(201);

    const body = JSON.parse(result.body);

    expect(body.images.length).toBeGreaterThan(0);
    expect(body.images[0]).toHaveProperty("id");
    expect(body.images[0]).toHaveProperty("url");
  });

  // // ---------- GET /images?id=... ----------
  // it('GET /.          ?id=img-123 → returns 200 with base64-encoded image body', async () => {
  //   const event = createEvent({
  //     httpMethod: 'GET',
  //     path: '/images',
  //     resource: '/images',
  //     queryStringParameters: { id: 'img-123' }, // ⬅️ if you use pathParameters, adjust
  //   });

  //   const result = (await handler(event)) as APIGatewayProxyResult;

  //   expect(result.statusCode).toBe(200);
  //   expect(result.isBase64Encoded).toBe(true);
  //   expect(result.headers?.['Content-Type']).toMatch(/^image\//);
  //   expect(typeof result.body).toBe('string'); // base64 string
  // });

  // it('GET /images without id → 400 (validation error)', async () => {
  //   const event = createEvent({
  //     httpMethod: 'GET',
  //     path: '/images',
  //     resource: '/images',
  //     queryStringParameters: null,
  //   });

  //   const result = (await handler(event)) as APIGatewayProxyResult;

  //   expect(result.statusCode).toBe(400);
  //   const body = JSON.parse(result.body);
  //   // Adjust message text to whatever you return
  //   expect(body.message.toLowerCase()).toContain('id');
  // });

  // ---------- DELETE /images?id=... ----------
  // it('DELETE /images/img-123 → returns 204 on successful delete', async () => {
  //   const event = createEvent({
  //     httpMethod: 'DELETE',
  //     path: '/images/img-123',
  //   });

  //   const result = (await handler(event)) as APIGatewayProxyResult;

  //   expect(result.statusCode).toBe(204);
  //   expect(result.body).toBe('');
  // });

  // Working
  // it('DELETE /image without id → 400 (validation error)', async () => {
  //   const event = createEvent({
  //     httpMethod: 'DELETE',
  //     path: '/image',
  //     resource: '/image',
  //     queryStringParameters: null,
  //   });

  //   const result = (await handler(event)) as APIGatewayProxyResult;

  //   expect(result.statusCode).toBe(400);
  //   const body = JSON.parse(result.body);
  //   expect(body.message.toLowerCase()).toContain('id');
  // });

  // // ---------- Unknown route / method ----------
  // it('Unknown route → 404', async () => {
  //   const event = createEvent({
  //     httpMethod: 'GET',
  //     path: '/unknown',
  //     resource: '/unknown',
  //     requestContext: {
  //       ...(createEvent().requestContext as any),
  //       httpMethod: 'GET',
  //       path: '/unknown',
  //       resourcePath: '/unknown',
  //     },
  //   });

  //   const result = (await handler(event)) as APIGatewayProxyResult;

  //   expect(result.statusCode).toBe(404);
  // });
});
