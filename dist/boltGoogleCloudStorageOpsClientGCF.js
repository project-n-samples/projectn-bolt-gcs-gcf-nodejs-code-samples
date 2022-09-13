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
exports.googleCloudFunctionHandler = void 0;
const boltGoogleCloudStorageOpsClient_1 = require("./boltGoogleCloudStorageOpsClient");
/**
googleCloudFunctionHandler is the entry function that is invoked by GCF to process an incoming event.

googleCloudFunctionHandler accepts the following input parameters as part of the event:

1) sdkType - Endpoint to which request is sent. The following values are supported:
    GoogleCloudStorage - The Request is sent to GoogleCloudStorage.
    Bolt - The Request is sent to Bolt, whose endpoint is configured via 'BOLT_URL' environment variable

2) requestType - type of request / operation to be performed. The following requests are supported:
    a) list_objects - list objects
    b) list_buckets - list buckets
    c) get_object_metadata - get object metadata
    d) get_bucket_metadata - get bucket metadata
    e) download_object - download object (md5 hash)
    f) upload_object - upload object
    g) delete_object - delete object

3) bucket - bucket name

4) key - key name

Following are examples of events, for various requests, that can be used to invoke the handler function.
    
a) Listing objects from Bolt bucket:
    {"requestType": "list_objects", "sdkType": "BOLT", "bucket": "<bucket>"}
    
b) Listing buckets from GoogleCloudStorage:
    {"requestType": "list_buckets", "sdkType": "GoogleCloudStorage"}
    
c) Get Bolt object metadata (GET_OBJECT_METADATA):
    {"requestType": "get_object_metadata", "sdkType": "BOLT", "bucket": "<bucket>", "key": "<key>"}
    
d) Check if GS bucket exists (GET_BUCKET_METADATA):
    {"requestType": "get_bucket_metadata","sdkType": "GoogleCloudStorage", "bucket": "<bucket>"}
    
e) Download object (its MD5 Hash) from Bolt:
    {"requestType": "download_object", "sdkType": "BOLT", "bucket": "<bucket>", "key": "<key>"}
    
f) Upload object to Bolt:
    {"requestType": "upload_object", "sdkType": "BOLT", "bucket": "<bucket>", "key": "<key>", "value": "<value>"}
    
g) Delete object from Bolt:
    {"requestType": "delete_object", "sdkType": "BOLT", "bucket": "<bucket>", "key": "<key>"}
*/
function googleCloudFunctionHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const event = req.body;
        const opsClient = new boltGoogleCloudStorageOpsClient_1.BoltGoogleCloudStorageOpsClient();
        const response = yield opsClient.processEvent(event);
        res.send(response);
    });
}
exports.googleCloudFunctionHandler = googleCloudFunctionHandler;
//# sourceMappingURL=boltGoogleCloudStorageOpsClientGCF.js.map