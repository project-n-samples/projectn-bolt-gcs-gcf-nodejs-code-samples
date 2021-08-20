const axios = require("axios");

function isValidUrl(strUrl) {
  try {
    new URL(strUrl);
  } catch (e) {
    return false;
  }
  return true;
}

function getUrlHostname(strUrl: string) {
  return getUrl(strUrl).hostname;
}

function getUrl(strUrl: string) {
  return new URL(strUrl);
}

export function getBoltURL(region: string) {
  let boltURL = process.env.BOLT_URL;
  if (!boltURL) {
    throw new Error(
      "Bolt URL could not be found.\nPlease expose env var BOLT_URL"
    );
  }
  boltURL = boltURL.replace(new RegExp("{region}", "g"), region);
  if (!isValidUrl(boltURL)) {
    throw new Error("Bolt URL is not valid. Please verify");
  }
  return getUrl(boltURL);
}

/**
 * Get Deployment region of the function
 * @returns region
 */
export async function getBoltRegion() {
  try {
    const response = await axios.get(
      "http://metadata.google.internal/computeMetadata/v1/instance/zone",
      {
        headers: {
          "Metadata-Flavor": "Google",
        },
      }
    );
    if (response.data) {
      const textParts = response.data.split("/");
      const zone = textParts[textParts.length - 1];
      const region = zone.includes("-")
        ? zone.substring(0, zone.lastIndexOf("-"))
        : zone;
      return region;
    } else {
      return new Error("Error in fetching Bolt's region.");
    }
  } catch (err) {
    return new Error(err);
  }
}
