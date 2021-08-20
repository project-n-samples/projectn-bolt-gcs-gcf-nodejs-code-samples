import { googleCloudFunctionHandler as boltGoogleCloudStorageOpsClientGCF } from "./boltGoogleCloudStorageOpsClientGCF_";
import { googleCloudFunctionHandler as boltGoogleCloudStorageValidateObjGCF } from "./boltGoogleCloudStorageValidateObjGCF_";
import { googleCloudFunctionHandler as boltAutoHealTestGCF } from "./boltAutoHealTestGCF_";
import { googleCloudFunctionHandler as boltGoogleCloudStoragePerfTestGCF } from "./boltGoogleCloudStoragePerfTestGCF_";

exports.boltGcsOpsClientGcfEntry = boltGoogleCloudStorageOpsClientGCF;
exports.boltGcsValidateObjGcfEntry = boltGoogleCloudStorageValidateObjGCF;
exports.boltGcsPerfTestGcfEntry = boltGoogleCloudStoragePerfTestGCF;
exports.boltAutoHealTestGcfEntry = boltAutoHealTestGCF;
