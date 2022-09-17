import { Storage } from "@google-cloud/storage";
import { Readable } from "stream";

runSampleCode();

/**
 * Test object writes, and listing of bucket objects
 */
async function runSampleCode() {
  const client = new Storage({ apiEndpoint: process.env.BOLT_URL });

  await uploadObject(
    client,
    "bucket name",
    "object key (ex: sample.txt)",
    "text content to upload to the object"
  );

  await listObjects(client, "bucket name");
}

/**
 * Uploads a text object to a bucket
 */
async function uploadObject(
  client,
  bucketName: string,
  objectKey: string,
  textContent: string,
  targetBolt: boolean = true
) {
  const file = await client.bucket(bucketName).file(objectKey);

  return new Promise((resolve, reject) => {
    Readable.from(textContent).pipe(
      file
        .createWriteStream({
          resumable: false,
          validation: false,
          metadata: {
            contentType: "text/json",
          },
        })
        .on("error", async (error) => {
          if (targetBolt) {
            const gsClient = new Storage();
            resolve(
              await uploadObject(
                gsClient,
                bucketName,
                objectKey,
                textContent,
                false
              )
            );
          } else {
            reject(error);
          }
        })
        .on("finish", () => {
          resolve(true);
        })
    );
  });
}

/**
 * Lists objects in a bucket
 */
async function listObjects(client, bucketName: string) {
  const [objects] = await client.bucket(bucketName).getFiles();

  console.log("Objects:");
  objects.forEach((object) => {
    console.log(object.name);
  });
}
