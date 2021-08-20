"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const boltGoogleCloudStorageOpsClientGCF_1 = require("./boltGoogleCloudStorageOpsClientGCF");
const boltGoogleCloudStorageValidateObjGCF_1 = require("./boltGoogleCloudStorageValidateObjGCF");
const boltAutoHealTestGCF_1 = require("./boltAutoHealTestGCF");
const boltGoogleCloudStoragePerfTestGCF_1 = require("./boltGoogleCloudStoragePerfTestGCF");
exports.BoltGoogleCloudStorageOpsClient = boltGoogleCloudStorageOpsClientGCF_1.googleCloudFunctionHandler;
exports.BoltGoogleCloudStorageValidateObj =
    boltGoogleCloudStorageValidateObjGCF_1.googleCloudFunctionHandler;
exports.BoltAutoHealTest = boltAutoHealTestGCF_1.googleCloudFunctionHandler;
exports.BoltGoogleCloudStoragePerfTest = boltGoogleCloudStoragePerfTestGCF_1.googleCloudFunctionHandler;
//# sourceMappingURL=index.js.map