import { uploadImage, getImage, deleteImage } from "../services/image.service";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";

const mockS3Send = jest.fn();
const mockDynamoSend = jest.fn();

jest.mock("@aws-sdk/client-s3", () => {
  const original = jest.requireActual("@aws-sdk/client-s3");
  
  return {
    ...original,
    S3Client: jest.fn(() => ({ send: jest.fn() })),
  };
});

jest.mock("@aws-sdk/client-dynamodb", () => {
  const original = jest.requireActual("@aws-sdk/client-dynamodb");
  return {
    ...original,
    DynamoDBClient: jest.fn(() => ({ send: jest.fn() })),
  };
});

describe("image.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BUCKET_NAME = "test-bucket"; // TODO: use your env names
    process.env.TABLE_NAME = "test-table";
  });

  it("getImage → reads from S3 and Dynamo and returns body + contentType", async () => {
    const imgBuf = Buffer.from("image-bytes");

    // fake S3 stream
    mockS3Send.mockResolvedValueOnce({
      Body: (async function* () {
        yield imgBuf;
      })(),
    });

    mockDynamoSend.mockResolvedValueOnce({
      Item: { contentType: { S: "image/png" } },
    });

    const result = await getImage("img-123");

    expect(mockS3Send).toHaveBeenCalledTimes(1);
    expect(mockDynamoSend).toHaveBeenCalledTimes(1);

    expect(result).not.toBeNull();
    expect(result?.data.equals(imgBuf)).toBe(true);
    expect(result?.contentType).toBe("image/png");
    expect(result?.metadata).toMatchObject({
      id: expect.any(String),
      filename: expect.any(String),
      contentType: expect.any(String),
      s3Key: expect.any(String),
      size: expect.any(Number),
      createdAt: expect.any(String),
    });
  });

  // it("deleteImage → deletes from S3 and Dynamo", async () => {
  //   mockS3Send.mockResolvedValueOnce({});
  //   mockDynamoSend.mockResolvedValueOnce({});

  //   await deleteImage("img-123");

  //   expect(mockS3Send).toHaveBeenCalledTimes(1);
  //   expect(mockDynamoSend).toHaveBeenCalledTimes(1);

  //   const s3Call = mockS3Send.mock.calls[0][0] as DeleteObjectCommand;
  //   const dynamoCall = mockDynamoSend.mock.calls[0][0] as DeleteItemCommand;

  //   expect((s3Call as any).input.Bucket).toBe("test-bucket");
  //   expect((s3Call as any).input.Key).toBe("img-123"); // TODO: adjust if you prefix keys
  //   expect((dynamoCall as any).input.TableName).toBe("test-table");
  // });
});
