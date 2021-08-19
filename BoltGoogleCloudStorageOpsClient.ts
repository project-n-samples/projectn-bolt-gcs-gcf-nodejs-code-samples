import { Storage } from "@google-cloud/storage";
const { createHmac, createHash } = require("crypto");
const zlib = require("zlib");
import { Readable } from "stream";
const axios = require("axios");

function isValidUrl(strUrl) {
  try {
    new URL(strUrl);
  } catch (e) {
    return false;
  }
  return true;
}

function getUrlHostname(strUrl: string) {
  return getUrl(strUrl).hostname;
}

function getUrl(strUrl: string) {
  return new URL(strUrl);
}

function getBoltURL(region: string) {
  let boltURL = process.env.BOLT_URL;
  if (!boltURL) {
    throw new Error(
      "Bolt URL could not be found.\nPlease expose env var BOLT_URL"
    );
  }
  boltURL = boltURL.replace(new RegExp("{region}", "g"), region);
  if (!isValidUrl(boltURL)) {
    throw new Error("Bolt URL is not valid. Please verify");
  }
  return getUrl(boltURL);
}

/**
 * Get Deployment region of the function
 * @returns region
 */
async function getBoltRegion() {
  try {
    const response = await axios.get(
      "http://metadata.google.internal/computeMetadata/v1/instance/zone",
      {
        headers: {
          "Metadata-Flavor": "Google",
        },
      }
    );
    if (response.data) {
      const textParts = response.data.split("/");
      const zone = textParts[textParts.length - 1];
      const region = zone.includes("-")
        ? zone.substring(0, zone.lastIndexOf("-"))
        : zone;
      return region;
    } else {
      return new Error("Error in fetching Bolt's region.");
    }
  } catch (err) {
    return new Error(err);
  }
}

export type GoogleCloudFunctionEvent = {
  sdkType: string;
  requestType: RequestType;
  bucket?: string;
  key?: string;
  value?: string;

  maxKeys?: string | number; // Max number of keys (objects) to fetch
  maxObjLength?: string | number; // Max length of alphanumeric random value to create
  isForStats?: string | boolean;
  TTFB?: string | boolean; // Time to first byte
};

export enum SdkTypes {
  Bolt = "BOLT",
  GCS = "GCS", // Google Cloud Storage
}

export enum RequestType {
  ListObjects = "LIST_OBJECTS",
  GetObject = "GET_OBJECT",
  GetObjectTTFB = "GET_OBJECT_TTFB", // This is only for Perf
  GetObjectMetadata = "GET_OBJECT_METADATA",
  ListBuckets = "LIST_BUCKETS",
  GetBucketMetadata = "GET_BUCKET_METADATA",
  UploadObject = "UPLOAD_OBJECT",
  DownloadObject = "DOWNLOAD_OBJECT",
  DeleteObject = "DELETE_OBJECT",

  GetObjectPassthrough = "GET_OBJECT_PASSTHROUGH", // This is only for Perf
  GetObjectPassthroughTTFB = "GET_OBJECT_PASSTHROUGH_TTFB", // This is only for Perf
  All = "ALL", // This is only for Perf
}

interface IBoltGoogleCloudStorageOpsClient {
  processEvent: any;
}

export type ListObjectsResponse = {
  objects: string[];
};

export type GetObjectResponse = {
  md5: string;
  contentLength?: number;
  isObjectCompressed?: boolean;
};

export type GetObjectMetadataResponse = {
  name: string;
  bucket: string;
  expiration: string;
  created: string;
  lastModified: string;
  contentLength: number;
  contentEncoding: string;
  eTag: string;
  // versionId: string;
  storageClass: string;
};

export type ListBucketsResponse = { buckets: string[] };

export type GetBucketMetadataResponse = {
  name: string;
  location: string;
  storageClass: string;
  versioningEnabled: boolean;
};

export type UploadObjectResponse = {
  eTag: string;
  md5Hash: string;
};

export type DownloadObjectResponse = GetObjectResponse;

export type DeleteObjectResponse = { deleted: boolean };
/**
 * processEvent extracts the parameters (sdkType, requestType, bucket/key) from the event,
 * uses those parameters to send an Object/Bucket CRUD request to Bolt/GoogleCloudStorage and returns back an appropriate response.
 */
export class BoltGoogleCloudStorageOpsClient
  implements IBoltGoogleCloudStorageOpsClient
{
  constructor() {}

  async processEvent(
    event: GoogleCloudFunctionEvent
  ): Promise<
    | ListObjectsResponse
    | GetObjectResponse
    | GetObjectMetadataResponse
    | ListBucketsResponse
    | GetBucketMetadataResponse
    | UploadObjectResponse
    | DeleteObjectResponse
    | Error
  > {
    console.log({ event });
    Object.keys(event).forEach((prop) => {
      if (["sdkType", "requestType"].includes(prop)) {
        event[prop] = event[prop].toUpperCase();
      }
    });
    /**
     * request is sent to GoogleCloudStorage if 'sdkType' is not passed as a parameter in the event.
     * create an Bolt/GoogleCloudStorage Client depending on the 'sdkType'
     */
    console.log("before client instantiation....");
    const region = await getBoltRegion();
    console.log({ region });
    const client =
      event.sdkType === SdkTypes.Bolt
        ? new Storage({ apiEndpoint: getBoltURL(region).toString() })
        : new Storage();
    console.log("after client instantiation....");
    try {
      //Performs an GoogleCloudStorage / Bolt operation based on the input 'requestType'

      switch (event.requestType) {
        case RequestType.ListObjects:
          return this.listObjects(client, event.bucket);
        case RequestType.GetObject:
        case RequestType.GetObjectTTFB:
        case RequestType.GetObjectPassthrough:
        case RequestType.GetObjectPassthroughTTFB:
          return this.getObject(
            client,
            event.bucket,
            event.key,
            event.isForStats
              ? event.isForStats === "true" || event.isForStats === true
              : false,
            [
              RequestType.GetObjectTTFB,
              RequestType.GetObjectPassthroughTTFB,
            ].includes(event.requestType as RequestType)
          );
        case RequestType.ListBuckets:
          return this.listBuckets(client);
        case RequestType.GetBucketMetadata:
          return this.getBucketMetadata(client, event.bucket);
        case RequestType.GetObjectMetadata:
          return this.GetObjectMetadata(client, event.bucket, event.key);
        case RequestType.UploadObject:
          return this.uploadObject(
            client,
            event.bucket,
            event.key,
            event.value
          );
        case RequestType.DownloadObject:
          return this.downloadObject(client, event.bucket, event.key);
        case RequestType.DeleteObject:
          return this.deleteObject(client, event.bucket, event.key);
      }
    } catch (ex) {
      console.error(ex);
      return new Error(ex);
    }
  }

  /**
   * Returns a list of 1000 objects from the given bucket in Bolt/GoogleCloudStorage
   * @param client
   * @param bucket
   * @returns list of first 1000 objects
   */
  async listObjects(
    client: Storage,
    bucket: string,
    maxKeys: number = 1000
  ): Promise<ListObjectsResponse> {
    const [files] = (await client.bucket(bucket).getFiles()) || [[]];
    return { objects: files.map((x) => x.name) };
  }

  async streamToBuffer(
    stream: Readable,
    timeToFirstByte = false
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      if (timeToFirstByte) {
        // resolve(stream.read(1)); //TODO: (MP): .read() not working for GoogleCloudStorage - Revisit later
        const chunks = [];
        stream.on("data", (chunk) => {
          chunks.push(chunk);
          resolve(Buffer.concat(chunks));
        });
        stream.on("error", reject);
      } else {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
      }
    });
  }

  async streamToString(stream: Readable, timeToFirstByte = false) {
    const buffer = await this.streamToBuffer(stream, timeToFirstByte);
    return new Promise((resolve, reject) => {
      resolve(buffer.toString("utf8"));
    });
  }

  async dezipped(stream, timeToFirstByte = false) {
    const buffer = await this.streamToBuffer(stream, timeToFirstByte);
    return new Promise((resolve, reject) => {
      if (!timeToFirstByte) {
        zlib.gunzip(buffer, function (err, buffer) {
          resolve(buffer.toString("utf8"));
        });
      } else {
        resolve(buffer.toString("utf8"));
      }
    });
  }

  /**
   * Gets the object from Bolt/GoogleCloudStorage, computes and returns the object's MD5 hash
     If the object is gzip encoded, object is decompressed before computing its MD5.
   * @param client
   * @param bucket 
   * @param key 
   * @param timeToFirstByte
   * @returns md5 hash of the object
   */
  async getObject(
    client: Storage,
    bucket: string,
    key: string,
    isForStats: boolean = false,
    timeToFirstByte: boolean = false
  ): Promise<GetObjectResponse> {
    // const [objectMetadata] = (await client
    //   .bucket(bucket)
    //   .file(key)
    //   .getMetadata()) || [[]];
    // const isObjectCompressed =
    //   objectMetadata.contentEncoding == "gzip" || key.endsWith(".gz");
    // const additional = isForStats
    //   ? { contentLength: objectMetadata.size, isObjectCompressed }
    //   : {};
    // return { md5: objectMetadata.md5Hash, ...additional };
    return this.downloadObject(
      client,
      bucket,
      key,
      isForStats,
      timeToFirstByte
    );
  }

  /**
   *
   * Retrieves the object's metadata from Bolt / GoogleCloudStorage.
   * @param client
   * @param bucket
   * @param key
   * @returns object metadata
   */
  async GetObjectMetadata(
    client: Storage,
    bucket: string,
    key: string
  ): Promise<GetObjectMetadataResponse> {
    const [objectMetadata] = (await client
      .bucket(bucket)
      .file(key)
      .getMetadata()) || [[]];
    return {
      name: objectMetadata.name,
      bucket: objectMetadata.bucket,
      expiration: objectMetadata.retentionExpirationTime
        ? new Date(objectMetadata.retentionExpirationTime).toISOString()
        : "",
      created: objectMetadata.timeCreated
        ? new Date(objectMetadata.timeCreated).toISOString()
        : "",
      lastModified: objectMetadata.updated
        ? new Date(objectMetadata.updated).toISOString()
        : "",
      contentLength: objectMetadata.size ? parseInt(objectMetadata.size) : 0,
      contentEncoding: objectMetadata.contentEncoding,
      eTag: objectMetadata.etag,
      storageClass: objectMetadata.storageClass,
    };
  }

  /**
   * Returns list of buckets owned by the sender of the request
   * @param client
   * @returns list of buckets
   */
  async listBuckets(client: Storage): Promise<ListBucketsResponse> {
    console.log("came to list buckets....");
    const response = await client.getBuckets();
    console.log("after getBuckets called...", { response });
    const [buckets] = response;
    return { buckets: (buckets || []).map((x) => x.name) };
  }

  /**
   * Checks if the bucket exists in Bolt/GoogleCloudStorage.
   * @param client
   * @param bucket
   * @returns status code and region if the bucket exists
   */
  async getBucketMetadata(
    client: Storage,
    bucket: string
  ): Promise<GetBucketMetadataResponse> {
    // const command = new GetBucketLocationCommand({ Bucket: bucket });
    const [bucketMetadata] = (await client.bucket(bucket).getMetadata()) || [
      [],
    ];
    return {
      name: bucketMetadata.name,
      location: bucketMetadata.location,
      storageClass: bucketMetadata.storageClass,
      versioningEnabled: bucketMetadata.versioningEnabled,
    };
  }

  /**
   * Uploads an object to Bolt/GoogleCloudStorage
   * @param client
   * @param bucket
   * @param key
   * @param value
   * @returns object metadata
   */
  async uploadObject(
    client: Storage,
    bucket: string,
    key: string,
    value: string
  ): Promise<UploadObjectResponse> {
    const file = await client.bucket(bucket).file(key);
    console.log("before Readable");
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
          .on("error", (error) => {
            console.log("error", error);
            reject(error);
          })
          .on("finish", () => {
            console.log("done");
            resolve(true);
          })
      );
    });
    console.log("after Readable");

    const [objectMetadata] = (await client
      .bucket(bucket)
      .file(key)
      .getMetadata()) || [[]];
    return {
      eTag: objectMetadata.etag,
      md5Hash: objectMetadata.md5Hash,
    };
  }

  /**
   * Uploads an object to Bolt/GoogleCloudStorage
   * @param client
   * @param bucket
   * @param key
   * @param value
   * @returns object metadata
   */
  async downloadObject(
    client: Storage,
    bucket: string,
    key: string,
    isForStats: boolean = false,
    timeToFirstByte: boolean = false
  ): Promise<DownloadObjectResponse> {
    const [objectMetadata] = (await client
      .bucket(bucket)
      .file(key)
      .getMetadata()) || [[]];
    const isObjectCompressed =
      objectMetadata.contentEncoding == "gzip" || key.endsWith(".gz");

    const readStream = await client.bucket(bucket).file(key).createReadStream();

    const data = isObjectCompressed
      ? await this.dezipped(readStream, timeToFirstByte)
      : await this.streamToString(readStream, timeToFirstByte);
    const md5 = createHash("md5").update(data).digest("hex").toUpperCase();

    const additional = isForStats
      ? {
          contentLength: objectMetadata.size
            ? parseInt(objectMetadata.size)
            : 0,
          isObjectCompressed,
        }
      : {};
    return { md5, ...additional };
  }

  /**
   * Delete an object from Bolt/GoogleCloudStorage
   * @param client
   * @param bucket
   * @param key
   * @returns status code
   */
  async deleteObject(
    client: Storage,
    bucket: string,
    key: string
  ): Promise<DeleteObjectResponse> {
    // const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await client.bucket(bucket).file(key).delete();
    return {
      deleted: true,
    };
  }
}
