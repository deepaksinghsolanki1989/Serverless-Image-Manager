import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand, GetItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Readable } from "stream";
import { ImageMetadata } from "../types";

const REGION = process.env.AWS_REGION || "ap-south-1";
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const s3Endpoint = process.env.S3_ENDPOINT;
const ddbEndpoint = process.env.DYNAMODB_ENDPOINT;

const credentials = (ACCESS_KEY && SECRET_KEY)
  ? { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY }
  : undefined;

const s3 = new S3Client({
  region: REGION,
  endpoint: s3Endpoint,
  forcePathStyle: true,
  credentials,
});

const ddb = new DynamoDBClient({
  region: REGION,
  endpoint: ddbEndpoint,
  credentials,
});

const TABLE = process.env.TABLE_NAME || "";
const BUCKET = process.env.BUCKET_NAME || "";

export async function uploadImage(params: { filename: string; contentType: string; buffer: Buffer }) {
  const { filename, contentType, buffer } = params;
  const id = Date.now().toString(36);
  const s3Key = `images/${id}-${filename}`;
  console.log(process.env.S3_ENDPOINT);
  console.log({ BUCKET })
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType
    })
  );

  const meta: ImageMetadata = {
    id,
    filename,
    contentType,
    s3Key,
    size: buffer.length,
    createdAt: new Date().toISOString()
  };

  await ddb.send(
    new PutItemCommand({
      TableName: TABLE,
      Item: marshall(meta)
    })
  );

  return { id, s3Key, metadata: meta };
}

export async function getImage(id: string): Promise<{ data: Buffer; contentType?: string; metadata: ImageMetadata } | null> {
  console.log({
    TableName: TABLE,
    Key: marshall({ id })
  })
  const resp = await ddb.send(
    new GetItemCommand({
      TableName: TABLE,
      Key: marshall({ id })
    })
  );

  console.log({ resp });

  if (!resp.Item) return null;
  const meta = unmarshall(resp.Item) as ImageMetadata;

  const s3Resp = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: meta.s3Key }));
  const stream = s3Resp.Body as Readable;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const data = Buffer.concat(chunks);

  return { data, contentType: s3Resp.ContentType || meta.contentType, metadata: meta };
}

export async function deleteImage(id: string): Promise<boolean> {
  const resp = await ddb.send(
    new GetItemCommand({
      TableName: TABLE,
      Key: marshall({ id })
    })
  );

  if (!resp.Item) return false;
  const meta = unmarshall(resp.Item) as ImageMetadata;

  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: meta.s3Key }));

  await ddb.send(
    new DeleteItemCommand({
      TableName: TABLE,
      Key: marshall({ id })
    })
  );

  return true;
}