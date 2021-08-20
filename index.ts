import { googleCloudFunctionHandler as boltGoogleCloudStorageOpsClientGCF } from "./boltGoogleCloudStorageOpsClientGCF";
import { googleCloudFunctionHandler as boltGoogleCloudStorageValidateObjGCF } from "./boltGoogleCloudStorageValidateObjGCF";
import { googleCloudFunctionHandler as boltAutoHealTestGCF } from "./boltAutoHealTestGCF";
import { googleCloudFunctionHandler as boltGoogleCloudStoragePerfTestGCF } from "./boltGoogleCloudStoragePerfTestGCF";

exports.BoltGoogleCloudStorageOpsClient = boltGoogleCloudStorageOpsClientGCF;
exports.BoltGoogleCloudStorageValidateObj =
  boltGoogleCloudStorageValidateObjGCF;
exports.BoltAutoHealTest = boltAutoHealTestGCF;
exports.BoltGoogleCloudStoragePerfTest = boltGoogleCloudStoragePerfTestGCF;