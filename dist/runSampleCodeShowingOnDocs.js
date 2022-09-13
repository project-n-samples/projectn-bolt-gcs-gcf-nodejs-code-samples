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
const sampleCodeShowingOnDocsSite_1 = require("./sampleCodeShowingOnDocsSite");
/**
 * To test inline object writes
 */
function runSampleCodeShowingOnDocs() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new storage_1.Storage({
            apiEndpoint: process.env.BOLT_URL,
        });
        yield (0, sampleCodeShowingOnDocsSite_1.uploadObject)(client, "bucket name", "object key", "text content to upload");
        yield (0, sampleCodeShowingOnDocsSite_1.listObjects)(client, "bucket name");
    });
}
runSampleCodeShowingOnDocs();
//# sourceMappingURL=runSampleCodeShowingOnDocs.js.map