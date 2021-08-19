import {
  BoltGoogleCloudStorageOpsClient,
  SdkTypes,
  RequestType,
  GoogleCloudFunctionEvent,
  GetObjectResponse,
  ListObjectsResponse,
} from "./BoltGoogleCloudStorageOpsClient";
const perf = require("execution-time")();
/**
 * <summary>
 * lambdaHandler is the handler function that is invoked by AWS Lambda to process an incoming event
 * for Bolt/GoogleCloudStorage Performance testing.
 * lambdaHandler accepts the following input parameters as part of the event:
 * 1) requestType - type of request / operation to be performed.The following requests are supported:
 *    a) list_objects_v2 - list objects
 *    b) get_object - get object
 *    c) get_object_ttfb - get object (first byte)
 *    d) get_object_passthrough - get object (via passthrough) of unmonitored bucket
 *    e) get_object_passthrough_ttfb - get object (first byte via passthrough) of unmonitored bucket
 *    f) put_object - upload object
 *    g) delete_object - delete object
 *    h) all - put, get, delete, list objects(default request if none specified)
 * 2) bucket - buck
 * Following are examples of events, for various requests, that can be used to invoke the handler function.
 * a) Measure List objects performance of Bolt/GoogleCloudStorage.
 *    {"requestType": "list_objects_v2", "bucket": "<bucket>", "maxKeys": "<maxKeys>"}
 * b) Measure Get object performance of Bolt / GoogleCloudStorage.
 *    {"requestType": "get_object", "bucket": "<bucket>"}
 * c) Measure Get object (first byte) performance of Bolt / GoogleCloudStorage.
 *    {"requestType": "get_object_ttfb", "bucket": "<bucket>"}
 * d) Measure Get object passthrough performance of Bolt.
 *    {"requestType": "get_object_passthrough", "bucket": "<unmonitored-bucket>"}
 * e) Measure Get object passthrough (first byte) performance of Bolt.
 *    {"requestType": "get_object_passthrough_ttfb", "bucket": "<unmonitored-bucket>"}
 * f) Measure Put object performance of Bolt / GoogleCloudStorage.
 *    {"requestType": "put_object", "bucket": "<bucket>"}
 * g) Measure Delete object performance of Bolt / GoogleCloudStorage.
 *    {"requestType": "delete_object", "bucket": "<bucket>"}
 * h) Measure Put, Delete, Get, List objects performance of Bolt / GoogleCloudStorage.
 *    {"requestType": "all", "bucket": "<bucket>"}
 * </summary>
 * <param name="input">incoming event data</param>
 * <param name="context">lambda context</param>
 * <re>response from BoltGoogleCloudStoragePerf</r
 *  */
exports.BoltGoogleCloudStoragePerf = async (req, res) => {
  const event: GoogleCloudFunctionEvent = req.body;
  const getPerfStats = async (requestType: RequestType) => {
    const maxKeys = event.maxKeys
      ? parseInt(event.maxKeys as string) <= 1000
        ? parseInt(event.maxKeys as string)
        : 1000
      : 1000;
    const generateRandomValue = () =>
      new Array(
        event.maxObjLength ? parseInt(event.maxObjLength as string) : 100
      )
        .fill(0)
        .map((x, i) =>
          String.fromCharCode(Math.floor(Math.random() * (122 - 48)) + 48)
        )
        .join("");

    const opsClient = new BoltGoogleCloudStorageOpsClient();
    const keys =
      requestType === RequestType.ListObjects
        ? new Array(10).fill(0).map((x, i) => "dummy key") // For ListObjectsV2, fetching objects process is only repeated for 10 times
        : [RequestType.UploadObject, RequestType.DeleteObject].includes(
            requestType
          )
        ? new Array(maxKeys)
            .fill(0)
            .map((x, i) => `bolt-GoogleCloudStorage-perf-${i}`) // Auto generating keys for PUT or DELETE related performace tests
        : (
            (
              await opsClient.processEvent({
                ...event,
                requestType: RequestType.ListObjects,
                sdkType: SdkTypes.GCS, // Here sdkType either GoogleCloudStorage or Bolt works since both returns same keys in ideal case
              })
            )["objects"] || []
          ).slice(0, maxKeys); // Fetch keys from buckets (GoogleCloudStorage/Bolt) for GET related performace tests

    // Run performance stats for given sdkType either GoogleCloudStorage or Bolt
    const runFor = async (sdkType) => {
      const times = [],
        throughputs = [],
        objectSizes = [];
      let compressedObjectsCount = 0,
        unCompressedObjectsCount = 0;
      for (let key of keys) {
        perf.start();
        const response = await opsClient.processEvent({
          ...event,
          requestType,
          isForStats: true,
          sdkType: sdkType,
          key,
          value: generateRandomValue(),
        });
        const perfTime = perf.stop().time;
        times.push(perfTime);
        if (requestType === RequestType.ListObjects) {
          throughputs.push(
            (response as ListObjectsResponse).objects.length / perfTime
          );
        } else if (
          [
            RequestType.GetObject,
            RequestType.GetObjectTTFB,
            RequestType.GetObjectPassthrough,
            RequestType.GetObjectPassthroughTTFB,
          ].includes(requestType)
        ) {
          if ((response as GetObjectResponse).isObjectCompressed) {
            compressedObjectsCount++;
          } else {
            unCompressedObjectsCount++;
          }
          objectSizes.push((response as GetObjectResponse).contentLength);
        }
      }

      return {
        ...computePerfStats(times, throughputs, objectSizes),
        ...(compressedObjectsCount || unCompressedObjectsCount
          ? {
              compressedObjectsCount,
              unCompressedObjectsCount,
            }
          : {}),
      };
    };
    const GoogleCloudStoragePerfStats = await runFor(SdkTypes.GCS);
    const boltPerfStats = await runFor(SdkTypes.Bolt);
    console.log(`Performance statistics of ${requestType} just got completed.`);
    return {
      // requestType,
      GoogleCloudStoragePerfStats,
      boltPerfStats,
    };
  };

  Object.keys(event).forEach((prop) => {
    if (["sdkType", "requestType"].includes(prop)) {
      event[prop] = event[prop].toUpperCase();
    }
  });
  console.log({ event });
  const perfStats =
    event.requestType !== RequestType.All
      ? await getPerfStats(event.requestType)
      : {
          [RequestType.UploadObject]: await getPerfStats(
            RequestType.UploadObject
          ),
          [RequestType.DeleteObject]: await getPerfStats(
            RequestType.DeleteObject
          ),
          [RequestType.ListObjects]: await getPerfStats(
            RequestType.ListObjects
          ),
          [RequestType.GetObject]: await getPerfStats(RequestType.GetObject),
        };
  res.send(perfStats);
};

/**
 * @param opTimes array of latencies
 * @param tpTimes array of throughputs
 * @param objSizes array of object sizes
 * @returns performance statistics (latency, throughput, object size)
 */
function computePerfStats(
  opTimes: Array<number>,
  tpTimes: Array<number> = [],
  objSizes: Array<number> = []
): {
  latency: { [key: string]: string };
  throughput: { [key: string]: string };
  objectSize?: { [key: string]: string };
} {
  const sort = (arr: Array<number>) => arr.sort((a, b) => a - b);
  const average = (arr: Array<number>) =>
    arr.reduce((a, b) => a + b) / arr.length;
  const sum = (arr: Array<number>) => arr.reduce((incr, x) => incr + x, 0);
  const stats = (_times, _fixedPositions, _measurement) => {
    if (_times.length === 0) {
      return {};
    }
    _times = sort(_times);
    const stats = {
      average: `${average(_times).toFixed(_fixedPositions)} ${_measurement}`,
      p50: `${_times[Math.floor(_times.length / 2)].toFixed(
        _fixedPositions
      )} ${_measurement}`,
      p90: `${_times[Math.floor((_times.length - 1) * 0.9)].toFixed(
        _fixedPositions
      )} ${_measurement}`,
    };
    return stats;
  };
  return {
    latency: stats(opTimes, 2, "ms"),
    throughput:
      tpTimes.length > 0 || opTimes.length === 0
        ? stats(tpTimes, 5, "objects/ms")
        : `${(opTimes.length / sum(opTimes)).toFixed(5)} objects/ms`,
    ...(objSizes.length > 0 ? { objectSize: stats(objSizes, 2, "bytes") } : {}),
  };
}
