
# Project N Bolt, GCS, GCF code samples for Node.js

Sample Node.js GoogleCloudFunctions (GCFs) that utilizes GoogleCloudStorage (GCS) Node.js client library, connecting to Bolt API by leveraging the same client library.

### Requirements

- Node.js 14 or later

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

### Getting Help

For additional assistance, please refer to [Project N Docs](https://xyz.projectn.co/) or contact us directly
[here](mailto:support@projectn.co)

