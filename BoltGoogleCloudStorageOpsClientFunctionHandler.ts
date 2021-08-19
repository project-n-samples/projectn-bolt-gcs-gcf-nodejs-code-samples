import { BoltGoogleCloudStorageOpsClient } from "./BoltGoogleCloudStorageOpsClient";

// TODO: Update the below code comments
/**
 *lambda_handler is the handler function that is invoked by AWS Lambda to process an incoming event.

lambda_handler accepts the following input parameters as part of the event:
1) sdkType - Endpoint to which request is sent. The following values are supported:
    GoogleCloudStorage - The Request is sent to GoogleCloudStorage.
    Bolt - The Request is sent to Bolt, whose endpoint is configured via 'BOLT_URL' environment variable

2) requestType - type of request / operation to be performed. The following requests are supported:
    a) list_objects_v2 - list objects
    b) list_buckets - list buckets
    c) head_object - head object
    d) head_bucket - head bucket
    e) get_object - get object (md5 hash)
    f) put_object - upload object
    g) delete_object - delete object

3) bucket - bucket name

4) key - key name

Following are examples of events, for various requests, that can be used to invoke the handler function.
a) Listing first 1000 objects from Bolt bucket:
    {"requestType": "list_objects_v2", "sdkType": "BOLT", "bucket": "<bucket>"}

b) Listing buckets from GoogleCloudStorage:
    {"requestType": "list_buckets", "sdkType": "GoogleCloudStorage"}

c) Get Bolt object metadata (HeadObject):
    {"requestType": "head_object", "sdkType": "BOLT", "bucket": "<bucket>", "key": "<key>"}

d) Check if GoogleCloudStorage bucket exists (HeadBucket):
    {"requestType": "head_bucket","sdkType": "GoogleCloudStorage", "bucket": "<bucket>"}

e) Retrieve object (its MD5 Hash) from Bolt:
    {"requestType": "get_object", "sdkType": "BOLT", "bucket": "<bucket>", "key": "<key>"}

f) Upload object to Bolt:
    {"requestType": "put_object", "sdkType": "BOLT", "bucket": "<bucket>", "key": "<key>", "value": "<value>"}

g) Delete object from Bolt:
    {"requestType": "delete_object", "sdkType": "BOLT", "bucket": "<bucket>", "key": "<key>"}
*/

exports.BoltGoogleCloudStorageOpsClient = async (req, res) => {
  const opsClient = new BoltGoogleCloudStorageOpsClient();
  const response = await opsClient.processEvent(req.body);
  res.send(response);
};
