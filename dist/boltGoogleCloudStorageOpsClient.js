"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoltGoogleCloudStorageOpsClient = exports.RequestType = exports.SdkTypes = void 0;
const storage_1 = require("@google-cloud/storage");
const { createHmac, createHash } = require("crypto");
const zlib = require("zlib");
const stream_1 = require("stream");
const common_1 = require("./common");
var SdkTypes;
(function (SdkTypes) {
    SdkTypes["Bolt"] = "BOLT";
    SdkTypes["GCS"] = "GCS";
})(SdkTypes = exports.SdkTypes || (exports.SdkTypes = {}));
var RequestType;
(function (RequestType) {
    RequestType["ListObjects"] = "LIST_OBJECTS";
    RequestType["GetObject"] = "GET_OBJECT";
    RequestType["GetObjectTTFB"] = "GET_OBJECT_TTFB";
    RequestType["GetObjectMetadata"] = "GET_OBJECT_METADATA";
    RequestType["ListBuckets"] = "LIST_BUCKETS";
    RequestType["GetBucketMetadata"] = "GET_BUCKET_METADATA";
    RequestType["UploadObject"] = "UPLOAD_OBJECT";
    RequestType["DownloadObject"] = "DOWNLOAD_OBJECT";
    RequestType["DeleteObject"] = "DELETE_OBJECT";
    RequestType["GetObjectPassthrough"] = "GET_OBJECT_PASSTHROUGH";
    RequestType["GetObjectPassthroughTTFB"] = "GET_OBJECT_PASSTHROUGH_TTFB";
    RequestType["All"] = "ALL";
})(RequestType = exports.RequestType || (exports.RequestType = {}));
/**
 * processEvent extracts the parameters (sdkType, requestType, bucket/key) from the event,
 * uses those parameters to send an Object/Bucket CRUD request to Bolt/GoogleCloudStorage and returns back an appropriate response.
 */
class BoltGoogleCloudStorageOpsClient {
    constructor() { }
    processEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const region = yield (0, common_1.getBoltRegion)();
            const client = event.sdkType === SdkTypes.Bolt
                ? new storage_1.Storage({ apiEndpoint: (0, common_1.getBoltURL)(region).toString() })
                : new storage_1.Storage();
            try {
                //Performs an GoogleCloudStorage / Bolt operation based on the input 'requestType'
                switch (event.requestType) {
                    case RequestType.ListObjects:
                        return this.listObjects(client, event.bucket, event.maxKeys ? parseInt(event.maxKeys) : 1000);
                    case RequestType.DownloadObject:
                    case RequestType.GetObject:
                    case RequestType.GetObjectTTFB:
                    case RequestType.GetObjectPassthrough:
                    case RequestType.GetObjectPassthroughTTFB:
                        return this.getObject(client, event.bucket, event.key, event.isForStats
                            ? event.isForStats === "true" || event.isForStats === true
                            : false, [
                            RequestType.GetObjectTTFB,
                            RequestType.GetObjectPassthroughTTFB,
                        ].includes(event.requestType));
                    case RequestType.ListBuckets:
                        return this.listBuckets(client);
                    case RequestType.GetBucketMetadata:
                        return this.getBucketMetadata(client, event.bucket);
                    case RequestType.GetObjectMetadata:
                        return this.getObjectMetadata(client, event.bucket, event.key);
                    case RequestType.UploadObject:
                        return this.uploadObject(client, event.bucket, event.key, event.value);
                    case RequestType.DeleteObject:
                        return this.deleteObject(client, event.bucket, event.key);
                }
            }
            catch (ex) {
                console.error(ex);
                return new Error(ex);
            }
        });
    }
    /**
     * Returns a list of 1000 objects from the given bucket in Bolt/GoogleCloudStorage
     * @param client
     * @param bucket
     * @returns list of first 1000 objects
     */
    listObjects(client, bucket, maxKeys = 1000) {
        return __awaiter(this, void 0, void 0, function* () {
            if (maxKeys > 1000) {
                maxKeys = 1000;
            }
            const [files] = (yield client
                .bucket(bucket)
                .getFiles({ maxResults: maxKeys })) || [[]];
            return { objects: files.map((x) => x.name) };
        });
    }
    streamToBuffer(stream, timeToFirstByte = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (timeToFirstByte) {
                    // resolve(stream.read(1)); //TODO: (MP): .read() not working for GoogleCloudStorage - Revisit later
                    const chunks = [];
                    stream.on("data", (chunk) => {
                        chunks.push(chunk);
                        resolve(Buffer.concat(chunks));
                    });
                    stream.on("error", reject);
                }
                else {
                    const chunks = [];
                    stream.on("data", (chunk) => chunks.push(chunk));
                    stream.on("error", reject);
                    stream.on("end", () => resolve(Buffer.concat(chunks)));
                }
            });
        });
    }
    streamToString(stream, timeToFirstByte = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = yield this.streamToBuffer(stream, timeToFirstByte);
            return new Promise((resolve, reject) => {
                resolve(buffer.toString("utf8"));
            });
        });
    }
    dezipped(stream, timeToFirstByte = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = yield this.streamToBuffer(stream, timeToFirstByte);
            return new Promise((resolve, reject) => {
                if (!timeToFirstByte) {
                    zlib.gunzip(buffer, function (err, buffer) {
                        resolve(buffer.toString("utf8"));
                    });
                }
                else {
                    resolve(buffer.toString("utf8"));
                }
            });
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
    getObject(client, bucket, key, isForStats = false, timeToFirstByte = false) {
        return __awaiter(this, void 0, void 0, function* () {
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
            return this.downloadObject(client, bucket, key, isForStats, timeToFirstByte);
        });
    }
    /**
     *
     * Retrieves the object's metadata from Bolt / GoogleCloudStorage.
     * @param client
     * @param bucket
     * @param key
     * @returns object metadata
     */
    getObjectMetadata(client, bucket, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const [objectMetadata] = (yield client
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
        });
    }
    /**
     * Returns list of buckets owned by the sender of the request
     * @param client
     * @returns list of buckets
     */
    listBuckets(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const [buckets] = (yield client.getBuckets()) || [[]];
            return { buckets: buckets.map((x) => x.name) };
        });
    }
    /**
     * Checks if the bucket exists in Bolt/GoogleCloudStorage.
     * @param client
     * @param bucket
     * @returns status code and region if the bucket exists
     */
    getBucketMetadata(client, bucket) {
        return __awaiter(this, void 0, void 0, function* () {
            // const command = new GetBucketLocationCommand({ Bucket: bucket });
            const [bucketMetadata] = (yield client.bucket(bucket).getMetadata()) || [
                [],
            ];
            return {
                name: bucketMetadata.name,
                location: bucketMetadata.location,
                storageClass: bucketMetadata.storageClass,
                versioningEnabled: bucketMetadata.versioningEnabled,
            };
        });
    }
    /**
     * Uploads an object to Bolt/GoogleCloudStorage
     * @param client
     * @param bucket
     * @param key
     * @param value
     * @returns object metadata
     */
    uploadObject(client, bucket, key, value, targetBolt = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = yield client.bucket(bucket).file(key);
            yield new Promise((resolve, reject) => {
                stream_1.Readable.from(value).pipe(file
                    .createWriteStream({
                    resumable: false,
                    validation: false,
                    metadata: {
                        contentType: "text/json",
                    },
                })
                    .on("error", (error) => __awaiter(this, void 0, void 0, function* () {
                    if (targetBolt) {
                        const gsClient = new storage_1.Storage();
                        resolve(yield this.uploadObject(gsClient, bucket, key, value, false));
                    }
                    else {
                        reject(error);
                    }
                }))
                    .on("finish", () => {
                    resolve(true);
                }));
            });
            const [objectMetadata] = (yield client
                .bucket(bucket)
                .file(key)
                .getMetadata()) || [[]];
            return {
                eTag: objectMetadata.etag,
                md5Hash: objectMetadata.md5Hash,
            };
        });
    }
    /**
     * Uploads an object to Bolt/GoogleCloudStorage
     * @param client
     * @param bucket
     * @param key
     * @param value
     * @returns object metadata
     */
    downloadObject(client, bucket, key, isForStats = false, timeToFirstByte = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const [objectMetadata] = (yield client
                .bucket(bucket)
                .file(key)
                .getMetadata()) || [[]];
            const isObjectCompressed = objectMetadata.contentEncoding == "gzip" || key.endsWith(".gz");
            const readStream = yield client.bucket(bucket).file(key).createReadStream();
            const data = isObjectCompressed
                ? yield this.dezipped(readStream, timeToFirstByte)
                : yield this.streamToString(readStream, timeToFirstByte);
            const md5 = createHash("md5").update(data).digest("hex").toUpperCase();
            const additional = isForStats
                ? {
                    contentLength: objectMetadata.size
                        ? parseInt(objectMetadata.size)
                        : 0,
                    isObjectCompressed,
                }
                : {};
            return Object.assign({ md5 }, additional);
        });
    }
    /**
     * Delete an object from Bolt/GoogleCloudStorage
     * @param client
     * @param bucket
     * @param key
     * @returns status code
     */
    deleteObject(client, bucket, key) {
        return __awaiter(this, void 0, void 0, function* () {
            // const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
            yield client.bucket(bucket).file(key).delete();
            return {
                deleted: true,
            };
        });
    }
}
exports.BoltGoogleCloudStorageOpsClient = BoltGoogleCloudStorageOpsClient;
//# sourceMappingURL=boltGoogleCloudStorageOpsClient.js.map