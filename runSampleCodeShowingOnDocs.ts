import { Storage } from "@google-cloud/storage";
import { listObjects, uploadObject } from "./sampleCodeShowingOnDocsSite";

/**
 * To test inline object writes
 */
async function runSampleCodeShowingOnDocs() {
  const client = new Storage({
    apiEndpoint: process.env.BOLT_URL,
  });

  await uploadObject(
    client,
    "bucket name",
    "object key",
    "text content to upload"
  );

  await listObjects(client, "bucket name");
}

runSampleCodeShowingOnDocs();
