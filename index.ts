import { googleCloudFunctionHandler as boltGoogleCloudStorageOpsClientGCF } from "./boltGoogleCloudStorageOpsClientGCF";
import { googleCloudFunctionHandler as boltGoogleCloudStorageValidateObjGCF } from "./boltGoogleCloudStorageValidateObjGCF";
import { googleCloudFunctionHandler as boltAutoHealTestGCF } from "./boltAutoHealTestGCF";
import { googleCloudFunctionHandler as boltGoogleCloudStoragePerfTestGCF } from "./boltGoogleCloudStoragePerfTestGCF";

exports.boltGcsOpsClientGcfEntry = boltGoogleCloudStorageOpsClientGCF;
exports.boltGcsValidateObjGcfEntry = boltGoogleCloudStorageValidateObjGCF;
exports.boltGcsPerfTestGcfEntry = boltGoogleCloudStoragePerfTestGCF;
exports.boltAutoHealTestGcfEntry = boltAutoHealTestGCF;
