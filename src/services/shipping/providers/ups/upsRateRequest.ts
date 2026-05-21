import type { StdShippingRatesReqBody } from "../../../../validations/index.js";
import { SERVICE_PREFERENCES } from "../../../../utils/constants.js";
import type {
  UpsRatedAddress,
  UpsRatingRequestPayload,
} from "./upsRateRequest.types.js";

/**
 * Build the UPS Rating API request body (`RateRequest` root) from our standard quote DTO.
 * Free‑form origin/destination are placed on AddressLine[]; city/state/ZIP/country remain
 * doc-style placeholders until you add structured addresses.
 */
export function buildUpsRatingRequest(
  reqBody: StdShippingRatesReqBody,
): UpsRatingRequestPayload {
  const accountNumber =
    typeof process.env.UPS_SHIPPER_NUMBER === "string"
      ? process.env.UPS_SHIPPER_NUMBER
      : "";

  const shipFrom = stubAddress(reqBody.origin, "Origin");
  const shipTo = stubAddress(reqBody.destination, "Destination");
  const service = upsServiceFromPreference(reqBody.service_preference);
  const packagingType = upsPackagingFromPackageType(reqBody.package_type);

  return {
    RateRequest: {
      Request: {
        TransactionReference: {
          CustomerContext: "carrier-integration-takehome",
        },
      },
      Shipment: {
        Shipper: {
          Name: "Shipper",
          ShipperNumber: accountNumber || "SHIPPER_STUB",
          Address: shipFrom,
        },
        ShipTo: {
          Name: "ShipTo",
          Address: shipTo,
        },
        ShipFrom: {
          Name: "ShipFrom",
          Address: shipFrom,
        },
        PaymentDetails: {
          ShipmentCharge: [
            {
              Type: "01",
              BillShipper: { AccountNumber: accountNumber },
            },
          ],
        },
        Service: {
          Code: service.Code,
          Description: service.Description,
        },
        NumOfPieces: "1",
        Package: {
          PackagingType: packagingType,
          Dimensions: {
            UnitOfMeasurement: { Code: "IN", Description: "Inches" },
            Length: String(reqBody.dimensions.length),
            Width: String(reqBody.dimensions.width),
            Height: String(reqBody.dimensions.height),
          },
          PackageWeight: {
            UnitOfMeasurement: { Code: "LBS", Description: "Pounds" },
            Weight: String(reqBody.weight),
          },
        },
      },
    },
  };
}

function stubAddress(raw: string, roleLabel: string): UpsRatedAddress {
  const trimmed = raw.trim() || `${roleLabel} address not provided`;
  const line = trimmed.length <= 105 ? trimmed : trimmed.slice(0, 105);
  const isDestination =
    roleLabel.trim().toLowerCase().startsWith("dest") ||
    roleLabel.trim().toLowerCase() === "destination";

  return {
    AddressLine: [line],
    ...(isDestination
      ? {
          City: "Alpharetta",
          StateProvinceCode: "GA",
          PostalCode: "30005",
          CountryCode: "US",
        }
      : {
          City: "TIMONIUM",
          StateProvinceCode: "MD",
          PostalCode: "21093",
          CountryCode: "US",
        }),
  };
}

function upsServiceFromPreference(
  pref: StdShippingRatesReqBody["service_preference"],
): {
  Code: string;
  Description: string;
} {
  switch (pref) {
    case SERVICE_PREFERENCES.EXPRESS:
      return { Code: "01", Description: "Next Day Air" };
    case SERVICE_PREFERENCES.STANDARD:
      return { Code: "03", Description: "Ground" };
    case SERVICE_PREFERENCES.ECONOMY:
      return { Code: "12", Description: "3 Day Select" };
    default:
      return { Code: "03", Description: "Ground" };
  }
}

function upsPackagingFromPackageType(packageType: string): {
  Code: string;
  Description: string;
} {
  const t = packageType.trim().toLowerCase();
  if (t.includes("letter") || t.includes("flat")) {
    return { Code: "01", Description: "UPS Letter" };
  }
  if (t.includes("tube")) {
    return { Code: "03", Description: "Tube" };
  }
  if (t.includes("pak") || t.includes("pack")) {
    return { Code: "04", Description: "PAK" };
  }
  return { Code: "02", Description: "Customer Supplied Package" };
}
