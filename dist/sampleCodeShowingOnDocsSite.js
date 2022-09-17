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
const storage_1 = require("@google-cloud/storage");
const stream_1 = require("stream");
runSampleCode();
/**
 * Test object writes, and listing of bucket objects
 */
function runSampleCode() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new storage_1.Storage({ apiEndpoint: process.env.BOLT_URL });
        yield uploadObject(client, "bucket name", "object key (ex: sample.txt)", "text content to upload to the object");
        yield listObjects(client, "bucket name");
    });
}
/**
 * Uploads a text object to a bucket
 */
function uploadObject(client, bucketName, objectKey, textContent, targetBolt = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = yield client.bucket(bucketName).file(objectKey);
        return new Promise((resolve, reject) => {
            stream_1.Readable.from(textContent).pipe(file
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
                    resolve(yield uploadObject(gsClient, bucketName, objectKey, textContent, false));
                }
                else {
                    reject(error);
                }
            }))
                .on("finish", () => {
                resolve(true);
            }));
        });
    });
}
/**
 * Lists objects in a bucket
 */
function listObjects(client, bucketName) {
    return __awaiter(this, void 0, void 0, function* () {
        const [objects] = yield client.bucket(bucketName).getFiles();
        console.log("Objects:");
        objects.forEach((object) => {
            console.log(object.name);
        });
    });
}
//# sourceMappingURL=sampleCodeShowingOnDocsSite.js.map