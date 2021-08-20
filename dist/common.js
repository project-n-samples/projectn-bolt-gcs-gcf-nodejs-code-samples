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
exports.getBoltRegion = exports.getBoltURL = void 0;
const axios = require("axios");
function isValidUrl(strUrl) {
    try {
        new URL(strUrl);
    }
    catch (e) {
        return false;
    }
    return true;
}
function getUrlHostname(strUrl) {
    return getUrl(strUrl).hostname;
}
function getUrl(strUrl) {
    return new URL(strUrl);
}
function getBoltURL(region) {
    let boltURL = process.env.BOLT_URL;
    if (!boltURL) {
        throw new Error("Bolt URL could not be found.\nPlease expose env var BOLT_URL");
    }
    boltURL = boltURL.replace(new RegExp("{region}", "g"), region);
    if (!isValidUrl(boltURL)) {
        throw new Error("Bolt URL is not valid. Please verify");
    }
    return getUrl(boltURL);
}
exports.getBoltURL = getBoltURL;
/**
 * Get Deployment region of the function
 * @returns region
 */
function getBoltRegion() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios.get("http://metadata.google.internal/computeMetadata/v1/instance/zone", {
                headers: {
                    "Metadata-Flavor": "Google",
                },
            });
            if (response.data) {
                const textParts = response.data.split("/");
                const zone = textParts[textParts.length - 1];
                const region = zone.includes("-")
                    ? zone.substring(0, zone.lastIndexOf("-"))
                    : zone;
                return region;
            }
            else {
                return new Error("Error in fetching Bolt's region.");
            }
        }
        catch (err) {
            return new Error(err);
        }
    });
}
exports.getBoltRegion = getBoltRegion;
//# sourceMappingURL=common.js.map