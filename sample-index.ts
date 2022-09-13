import { listObjects, uploadObject } from "./sampleShowingOnDocsSite";

import { Storage } from "@google-cloud/storage";

const client = new Storage({
  apiEndpoint: "https://bolt.us-central1.longrunninggcp.bolt.projectn.co",
});

// uploadObject(
//   client,
//   "mp-test-bucket-2022-09-13",
//   "object-from-node.txt",
//   "text content to upload"
// );

listObjects("mp-test-bucket-2022-09-13").catch(console.error);
