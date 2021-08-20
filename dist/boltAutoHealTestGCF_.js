"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCloudFunctionHandler = void 0;
const boltGoogleCloudStorageOpsClient_1 = require("./boltGoogleCloudStorageOpsClient_");
const perf = require("execution-time")();
/**
 * <summary>
 * lambdaHandler is the handler function that is invoked by AWS Lambda to process an incoming event for
 * performing auto-heal tests.
 * lambdaHandler accepts the following input parameters as part of the event:
 * 1) bucket - bucket name
 * 2) key - key name
 * </summary>
 * <param name="input">incoming event</param>
 * <param name="context">lambda context</param>
 * <returns>time taken to auto-heal</returns>
 */
function googleCloudFunctionHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const event = req.body;
        const WAIT_TIME_BETWEEN_RETRIES = 2000; //ms
        const wait = (ms) => {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        };
        const opsClient = new boltGoogleCloudStorageOpsClient_1.BoltGoogleCloudStorageOpsClient();
        let isObjectHealed = false;
        perf.start();
        while (!isObjectHealed) {
            try {
                yield opsClient.processEvent(Object.assign(Object.assign({}, event), { requestType: boltGoogleCloudStorageOpsClient_1.RequestType.GetObject, sdkType: boltGoogleCloudStorageOpsClient_1.SdkTypes.Bolt }));
                isObjectHealed = true;
            }
            catch (ex) {
                console.log("Waiting...");
                yield wait(WAIT_TIME_BETWEEN_RETRIES);
                console.log("Re-trying Get Object...");
            }
        }
        const results = perf.stop();
        res.send({
            auto_heal_time: `${(results.time > WAIT_TIME_BETWEEN_RETRIES
                ? results.time - WAIT_TIME_BETWEEN_RETRIES
                : results.time).toFixed(2)} ms`,
        });
    });
}
exports.googleCloudFunctionHandler = googleCloudFunctionHandler;
//# sourceMappingURL=boltAutoHealTestGCF_.js.map