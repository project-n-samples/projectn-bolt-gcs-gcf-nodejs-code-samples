"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const boltGoogleCloudStorageOpsClientGCF_1 = require("./boltGoogleCloudStorageOpsClientGCF");
const boltGoogleCloudStorageValidateObjGCF_1 = require("./boltGoogleCloudStorageValidateObjGCF");
const boltAutoHealTestGCF_1 = require("./boltAutoHealTestGCF");
const boltGoogleCloudStoragePerfTestGCF_1 = require("./boltGoogleCloudStoragePerfTestGCF");
exports.boltGcsOpsClientGcfEntry = boltGoogleCloudStorageOpsClientGCF_1.googleCloudFunctionHandler;
exports.boltGcsValidateObjGcfEntry = boltGoogleCloudStorageValidateObjGCF_1.googleCloudFunctionHandler;
exports.boltGcsPerfTestGcfEntry = boltGoogleCloudStoragePerfTestGCF_1.googleCloudFunctionHandler;
exports.boltAutoHealTestGcfEntry = boltAutoHealTestGCF_1.googleCloudFunctionHandler;
//# sourceMappingURL=index.js.map