import { Storage } from "@google-cloud/storage";
import { Readable } from "stream";

const client = new Storage({
  apiEndpoint: "https://bolt.us-central1.longrunninggcp.bolt.projectn.co",
});

export async function listObjects(bucketName: string) {
  // Lists objects in the bucket
  const [objects] = await client.bucket(bucketName).getFiles();

  console.log("Objects:");
  objects.forEach((object) => {
    console.log(object.name);
  });
}

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

// listObjects("bucket name").catch(console.error); // Can be called from other place index.ts

// uploadObject(client, "bucket name", "object key", "text content to upload"); // Can be called from other place index.ts
