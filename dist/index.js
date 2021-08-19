"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BoltGoogleCloudStorageOpsClientGCF_1 = require("./BoltGoogleCloudStorageOpsClientGCF");
const BoltGoogleCloudStorageValidateObjGCF_1 = require("./BoltGoogleCloudStorageValidateObjGCF");
const BoltAutoHealTestGCF_1 = require("./BoltAutoHealTestGCF");
const BoltGoogleCloudStoragePerfTestGCF_1 = require("./BoltGoogleCloudStoragePerfTestGCF");
exports.BoltGoogleCloudStorageOpsClient = BoltGoogleCloudStorageOpsClientGCF_1.googleCloudFunctionHandler;
exports.BoltGoogleCloudStorageValidateObj =
    BoltGoogleCloudStorageValidateObjGCF_1.googleCloudFunctionHandler;
exports.BoltAutoHealTest = BoltAutoHealTestGCF_1.googleCloudFunctionHandler;
exports.BoltGoogleCloudStoragePerfTest = BoltGoogleCloudStoragePerfTestGCF_1.googleCloudFunctionHandler;
//# sourceMappingURL=index.js.map