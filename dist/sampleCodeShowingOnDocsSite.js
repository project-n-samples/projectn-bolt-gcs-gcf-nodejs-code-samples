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
exports.runSampleCode = void 0;
const storage_1 = require("@google-cloud/storage");
const stream_1 = require("stream");
// Lists objects in a bucket
function listObjects(client, bucket) {
    return __awaiter(this, void 0, void 0, function* () {
        const [objects] = yield client.bucket(bucket).getFiles();
        console.log("Objects:");
        objects.forEach((object) => {
            console.log(object.name);
        });
    });
}
// Write object to a bucket
function uploadObject(client, bucket, key, value) {
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
                reject(error);
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
 * To test inline object writes
 */
function runSampleCode() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new storage_1.Storage({
            apiEndpoint: process.env.BOLT_URL,
        });
        yield uploadObject(client, "bucket name", "object key", "text content to upload");
        yield listObjects(client, "bucket name");
    });
}
exports.runSampleCode = runSampleCode;
runSampleCode();
//# sourceMappingURL=sampleCodeShowingOnDocsSite.js.map