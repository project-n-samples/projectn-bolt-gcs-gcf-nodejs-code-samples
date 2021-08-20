"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const boltGoogleCloudStorageOpsClientGCF_1 = require("./boltGoogleCloudStorageOpsClientGCF_");
const boltGoogleCloudStorageValidateObjGCF_1 = require("./boltGoogleCloudStorageValidateObjGCF_");
const boltAutoHealTestGCF_1 = require("./boltAutoHealTestGCF_");
const boltGoogleCloudStoragePerfTestGCF_1 = require("./boltGoogleCloudStoragePerfTestGCF_");
exports.boltGcsOpsClientGcfEntry = boltGoogleCloudStorageOpsClientGCF_1.googleCloudFunctionHandler;
exports.boltGcsValidateObjGcfEntry = boltGoogleCloudStorageValidateObjGCF_1.googleCloudFunctionHandler;
exports.boltGcsPerfTestGcfEntry = boltGoogleCloudStoragePerfTestGCF_1.googleCloudFunctionHandler;
exports.boltAutoHealTestGcfEntry = boltAutoHealTestGCF_1.googleCloudFunctionHandler;
//# sourceMappingURL=index.js.map