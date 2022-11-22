
# Project N Bolt, GCS, GCF code samples for Node.js

Sample Node.js GoogleCloudFunctions (GCFs) that utilizes GoogleCloudStorage (GCS) Node.js client library, connecting to Bolt API by leveraging the same client library.

### Requirements

- Node.js 14 or later
- @google-cloud/storage 6.7.0 or later

### Build from source

* Download the source and change to the directory containing the sample codes:

```bash
git clone https://github.com/project-n-samples/projectn-bolt-gcs-gcf-nodejs-code-samples.git

cd projectn-bolt-gcs-gcf-nodejs-code-samples
```

### Deploy

This repository contians mainly four GCFs, and client operations which covers to perform basic operations on GCS and Bolt API.
  - boltGoogleCloudStorageOpsClient.ts - GCS/BOLT client operations
  - boltGoogleCloudStorageOpsClientGCF.ts - GCF
  - boltGoogleCloudStorageValidateObjGCF.ts - GCF
  - boltGoogleCloudStoragePerfTestGCF.ts - GCF
  - boltAutoHealTestGCF.ts - GCF

To deploy the above GCFs, run the following commands:

```bash
gcloud functions deploy <give-meaning-full-name-for-gcf> \
--entry-point <entry-point-function> \
--runtime nodejs14 \
--trigger-http \
--memory 512MB \
--timeout 240s \
--service-account=<service-account-email> \
--project=<project-id> \
--region <region> \
--set-env-vars BOLT_URL=<Bolt-Service-Url>
```

Ex:
```bash
gcloud functions deploy BoltGcsOpsClient \
--runtime nodejs14 \
--entry-point boltGcsOpsClientGcfEntry \
--trigger-http \
--allow-unauthenticated \
--project mp-test-project-323220 \
--service-account mp-test-service-account@mp-test-project-323220.iam.GCServiceaccount.com \
--set-env-vars BOLT_URL=https://bolt.{region}.solaw2-gcp.bolt.projectn.co  \
--memory 512MB \
--timeout 240s \
```

#### Repeat the same deployment procecss for remaning GCF functions

```bash
gcloud functions deploy BoltGcsValidateObj \
--runtime nodejs14 \
--entry-point boltGcsValidateObjGcfEntry \
...
...
```

```bash
gcloud functions deploy BoltGcsPerfTest \
--runtime nodejs14 \
--entry-point boltGcsPerfTestGcfEntry \
...
...
```

```bash
gcloud functions deploy BoltAutoHealTest \
--runtime nodejs14 \
--entry-point boltAutoHealTestGcfEntry \
...
...
```

### Usage

The sample Node.js GCFs illustrates the usage and various operations, via separate entry points,
that can be performed using GCS client library for Node.js. The deployed Node.js GCF can be tested
from the Google cloud console by specifying a triggering event in JSON format.

Please ensure that `Bolt` is deployed before testing the sample Node.js GCF. If you haven't deployed `Bolt`,
follow the instructions given [here](https://xyz.projectn.co/installation-guide#estimate-savinGCS) to deploy `Bolt`.

#### Testing Bolt or GCS Operations

`BoltGcsOpsClient` is the function that enables the user to perform Bolt or GCS operations.
It sends a Bucket or Object request to Bolt or GCS and returns an appropriate response based on the parameters
passed in as input.

* `BoltGcsOpsClient` represents a GCF that is invoked by an HTTP Request.


* `BoltGcsOpsClient` accepts the following input parameters as part of the HTTP Request:
    * sdkType - Endpoint to which request is sent. The following values are supported:
        * GCS - The Request is sent to GCS.
        * Bolt - The Request is sent to Bolt, whose endpoint is configured via 'BOLT_URL' environment variable

    * requestType - type of request / operation to be performed. The following requests are supported:
        * list_objects - list objects
        * list_buckets - list buckets
        * get_object_metadata - head object
        * get_bucket_metadata - head bucket
        * download_object - get object (md5 hash)
        * upload_object - upload object
        * delete_object - delete object

    * bucket - bucket name

    * key - key name


* Following are examples of events, for various requests, that can be used to invoke the function.
    * Listing objects from Bolt bucket:
      ```json
        {"requestType": "list_objects", "sdkType": "BOLT", "bucket": "<bucket>"}
      ```
    * Listing buckets from GCS:
      ```json
      {"requestType": "list_buckets", "sdkType": "GCS"}
      ```
    * Get Bolt object metadata (GET_OBJECT_METADATA):
      ```json
      {"requestType": "get_object_metadata", "sdkType": "BOLT", "bucket": "<bucket>", "key": "<key>"}
      ```
    * Check if GCS bucket exists (GET_BUCKET_METADATA):
      ```json
      {"requestType": "get_bucket_metadata","sdkType": "GCS", "bucket": "<bucket>"}
      ```  
    * Download object (its MD5 Hash) from Bolt:
      ```json
      {"requestType": "download_object", "sdkType": "BOLT", "bucket": "<bucket>", "key": "<key>"}
      ```  
    * Upload object to Bolt:
      ```json
      {"requestType": "upload_object", "sdkType": "BOLT", "bucket": "<bucket>", "key": "<key>", "value": "<value>"}
      ```  
    * Delete object from Bolt:
      ```json
      {"requestType": "delete_object", "sdkType": "BOLT", "bucket": "<bucket>", "key": "<key>"}
      ```


#### Data Validation Tests

`BoltGcsValidateObj` is the function that enables the user to perform data validation tests. It retrieves
the object from Bolt and GCS (Bucket Cleaning is disabled), computes and returns their corresponding MD5 hash.
If the object is gzip encoded, object is decompressed before computing its MD5.

* `BoltGcsValidateObj` represents a GCF that is invoked by an HTTP Request for performing
  data validation tests. To use this Function, change the entry point to `boltGcsValidateObjGcfEntry`


* `BoltGcsValidateObj` accepts the following input parameters as part of the HTTP Request:
    * bucket - bucket name

    * key - key name

* Following is an example of an event that can be used to invoke the function.
    * Retrieve object(its MD5 hash) from Bolt and GCS:

      If the object is gzip encoded, object is decompressed before computing its MD5.
      ```json
      {"bucket": "<bucket>", "key": "<key>"}
      ```

#### Performance Tests

`BoltGcsPerfTest` is the function that enables the user to run Bolt or GCS Performance tests. It measures the 
performance of Bolt or GCS Operations and returns statistics based on the operation. Before using this
handler, ensure that a source bucket has been crunched by `Bolt` with cleaner turned `OFF`. `Get, List Objects` tests
are run using the first 1000 objects in the bucket and `Put Object` tests are run using objects of size `100 bytes`.
`Delete Object` tests are run on objects that were created by the `Put Object` test.

* `BoltGcsPerfTest` represents a GCF that is invoked by an HTTP Request for performing
  Bolt / GCS Performance testing. To use this Function, change the entry point to `boltGcsPerfTestGcfEntry`.
  

* `BoltGcsPerfTest` accepts the following input parameters as part of the HTTP Request:
  * requestType - type of request / operation to be performed. The following requests are supported:
    * list_objects - list objects
    * get_object - download object
    * get_object_ttfb - download object (first byte) 
    * get_object_passthrough - download object (via passthrough) of unmonitored bucket
    * get_object_passthrough_ttfb - download object (first byte via passthrough) of unmonitored bucket 
    * upload_object - upload object
    * delete_object - delete object
    * all - upload, download, delete, list objects (default request if none specified)
      
  * bucket - bucket name
    

* Following are examples of various HTTP requests, that can be used to invoke the function.
    * Measure List objects performance of Bolt / GCS.
      ```json
      {"requestType": "list_objects", "bucket": "<bucket>"}
      ```
    * Measure Download object performance of Bolt / GCS.
      ```json
      {"requestType": "get_object", "bucket": "<bucket>"}
      ```
    * Measure Download object (first byte) performance of Bolt / GCS.
      ```json
      {"requestType": "get_object_ttfb", "bucket": "<bucket>"} 
      ```
    * Measure Download object passthrough performance of Bolt.
      ```json
      {"requestType": "get_object_passthrough", "bucket": "<unmonitored-bucket>"}
      ```
    * Measure Download object passthrough (first byte) performance of Bolt.
      ```json
      {"requestType": "get_object_passthrough_ttfb", "bucket": "<unmonitored-bucket>"}
      ```
    * Measure Upload object performance of Bolt / GCS.
      ```json
      {"requestType": "upload_object", "bucket": "<bucket>"}
      ```
    * Measure Delete object performance of Bolt / GCS.
      ```json
      {"requestType": "delete_object", "bucket": "<bucket>"}
      ```
    * Measure Upload, Delete, Download, List objects performance of Bolt / GCS.
      ```json
      {"requestType": "all", "bucket": "<bucket>"}
      ```
      

#### Auto Heal Tests

`BoltAutoHealTest` is the function that enables the user to run auto heal tests. Before running this function,
modify `data-cruncher` to use `coldline` tier-class and set `backupduration` and `recoveryscannerperiod` to `1 minute` 
to ensure that the auto-healing duration is within the function execution timeout interval. Crunch a sample bucket
having a single object. Then delete the single fragment object from the `n-data` bucket. Now run this function,
passing the name of the crunched bucket along with the single object as input parameters to the function. The handler
attempts to retrieve object repeatedly until it succeeds, which would indicate successful auto-healing of the object
and returns the time taken to do so.

* `BoltAutoHealTest` represents a GCF that is invoked by an HTTP Request for performing
  Auto-Heal testing. To use this Function, change the entry point to `boltAutoHealTestGcfEntry`.
  

* BoltAutoHealHandler accepts the following input parameters as part of the event:
  * bucket - bucket name
    
  * key - key name
    

* Following is an example of a HTTP Request that can be used to invoke the function.
    * Measure Auto-Heal time of an object in Bolt.
      ```json
      {"bucket": "<bucket>", "key": "<key>"}
      ```

### Getting Help

For additional assistance, please refer to [Project N Docs](https://xyz.projectn.co/) or contact us directly
[here](mailto:support@projectn.co)
