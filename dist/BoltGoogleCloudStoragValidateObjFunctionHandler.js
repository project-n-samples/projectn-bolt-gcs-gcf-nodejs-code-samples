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
const BoltGoogleCloudStorageOpsClient_1 = require("./BoltGoogleCloudStorageOpsClient");
/**
 * <summary>
 * lambdaHandler is the handler function that is invoked by AWS Lambda to process an incoming event for
 * performing data validation tests.
 * lambdaHandler accepts the following input parameters as part of the event:
 * 1) bucket - bucket name
 * 2) key - key name
 * lambdaHandler retrieves the object from Bolt and GoogleCloudStorage (if BucketClean is OFF), computes and returns their
 * corresponding MD5 hash. If the object is gzip encoded, object is decompressed before computing its MD5.
 * </summary>
 * <param name="event">incoming event</param>
 * <param name="context">lambda context</param>
 * <returns>md5s of object retrieved from Bolt and GoogleCloudStorage.</returns>
 */
exports.BoltGoogleCloudStoragValidateObj = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const opsClient = new BoltGoogleCloudStorageOpsClient_1.BoltGoogleCloudStorageOpsClient();
    const boltGetObjectResponse = yield opsClient.processEvent(Object.assign(Object.assign({}, req.body), { requestType: BoltGoogleCloudStorageOpsClient_1.RequestType.GetObject, sdkType: BoltGoogleCloudStorageOpsClient_1.SdkTypes.Bolt }));
    const GoogleCloudStorageGetObjectResponse = yield opsClient.processEvent(Object.assign(Object.assign({}, req.body), { requestType: BoltGoogleCloudStorageOpsClient_1.RequestType.GetObject, sdkType: BoltGoogleCloudStorageOpsClient_1.SdkTypes.GCS }));
    return res.send({
        "gcs-md5": GoogleCloudStorageGetObjectResponse["md5"],
        "bolt-md5": boltGetObjectResponse["md5"],
    });
});
//# sourceMappingURL=BoltGoogleCloudStoragValidateObjFunctionHandler.js.map