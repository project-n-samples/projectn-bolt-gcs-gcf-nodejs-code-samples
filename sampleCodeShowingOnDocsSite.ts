import { Storage } from "@google-cloud/storage";
import { Readable } from "stream";

/**
 * Lists objects in a bucket
 */
async function listObjects(client, bucket: string) {
  const [objects] = await client.bucket(bucket).getFiles();

  console.log("Objects:");
  objects.forEach((object) => {
    console.log(object.name);
  });
}

/**
 * To test inline object writes
 */
async function runSampleCode() {
  const client = new Storage({ apiEndpoint: process.env.BOLT_URL });

  await uploadObject(
    client,
    "bucket name",
    "object key",
    "text content to upload"
  );

  await listObjects(client, "bucket name");
}

runSampleCode();

/**
 * Write object to a bucket
 */
async function uploadObject(
  client,
  bucket: string,
  key: string,
  value: string
) {
  const file = await client.bucket(bucket).file(key);

  return new Promise((resolve, reject) => {
    Readable.from(value).pipe(
      file
        .createWriteStream({
          resumable: false,
          validation: false,
          metadata: {
            contentType: "text/json",
          },
        })
        .on("error", async (error) => {
          reject(error);
        })
        .on("finish", () => {
          resolve(true);
        })
    );
  });
}
