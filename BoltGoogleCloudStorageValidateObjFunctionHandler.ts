import {
  BoltGoogleCloudStorageOpsClient,
  SdkTypes,
  RequestType,
  GoogleCloudFunctionEvent,
} from "./BoltGoogleCloudStorageOpsClient";

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

exports.BoltGoogleCloudStorageValidateObj = async (req, res) => {
  const event: GoogleCloudFunctionEvent = req.body;
  const opsClient = new BoltGoogleCloudStorageOpsClient();
  const boltGetObjectResponse = await opsClient.processEvent({
    ...event,
    requestType: RequestType.GetObject,
    sdkType: SdkTypes.Bolt,
  });
  const GoogleCloudStorageGetObjectResponse = await opsClient.processEvent({
    ...event,
    requestType: RequestType.GetObject,
    sdkType: SdkTypes.GCS,
  });
  res.send({
    "gcs-md5": GoogleCloudStorageGetObjectResponse["md5"],
    "bolt-md5": boltGetObjectResponse["md5"],
  });
};
