import { Storage } from "@google-cloud/storage";
import { Readable } from "stream";

export async function listObjects(client, bucketName: string) {
  // Lists objects in the bucket
  const [objects] = await client.bucket(bucketName).getFiles();

  console.log("Objects:");
  objects.forEach((object) => {
    console.log(object.name);
  });
}

/**
 * Sample code to test inline writes
 * @param client
 * @param bucket
 * @param key
 * @param value
 * @param isForBoltClient
 * @returns
 */
export async function uploadObject(
  client,
  bucket: string,
  key: string,
  value: string,
  isForBoltClient: boolean = true
) {
  const file = await client.bucket(bucket).file(key);
  await new Promise((resolve, reject) => {
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
          if (isForBoltClient) {
            const gsClient = new Storage();
            resolve(await uploadObject(gsClient, bucket, key, value, false));
          } else {
            reject(error);
          }
        })
        .on("finish", () => {
          resolve(true);
        })
    );
  });

  const [objectMetadata] = (await client
    .bucket(bucket)
    .file(key)
    .getMetadata()) || [[]];
  return {
    eTag: objectMetadata.etag,
    md5Hash: objectMetadata.md5Hash,
  };
}
