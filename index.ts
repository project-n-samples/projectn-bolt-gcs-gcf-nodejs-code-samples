import { googleCloudFunctionHandler as boltGoogleCloudStorageOpsClientGCF } from "./BoltGoogleCloudStorageOpsClientGCF";
import { googleCloudFunctionHandler as boltGoogleCloudStorageValidateObjGCF } from "./BoltGoogleCloudStorageValidateObjGCF";
import { googleCloudFunctionHandler as boltAutoHealTestGCF } from "./BoltAutoHealTestGCF";
import { googleCloudFunctionHandler as boltGoogleCloudStoragePerfTestGCF } from "./BoltGoogleCloudStoragePerfTestGCF";

exports.BoltGoogleCloudStorageOpsClient = boltGoogleCloudStorageOpsClientGCF;
exports.BoltGoogleCloudStorageValidateObj =
  boltGoogleCloudStorageValidateObjGCF;
exports.BoltAutoHealTest = boltAutoHealTestGCF;
exports.BoltGoogleCloudStoragePerfTest = boltGoogleCloudStoragePerfTestGCF;