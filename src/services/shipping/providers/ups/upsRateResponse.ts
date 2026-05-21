import type { StdShippingRatesResBody } from "../../../../validations/index.js";
import { ApiError } from "../../../../utils/apiError.js";
import { StatusCodes } from "../../../../utils/constants.js";
import type {
  UpsMonetaryCharges,
  UpsRateResponseEnvelope,
  UpsRatedShipment,
} from "./upsRateResponse.types.js";

const UPS_PROVIDER_NAME = "UPS";

/** UPS Rating success payloads use `ResponseStatus.Code === "1"`. */
const UPS_RESPONSE_SUCCESS_CODE = "1";

/**
 * Narrow our standard carrier quote from a UPS Rating `RateResponse` body.
 * Uses the first rated option when UPS returns multiple `RatedShipment` entries.
 */
export function mapUpsRatingResponseToStd(
  raw: unknown,
): StdShippingRatesResBody {
  if (!raw || typeof raw !== "object") {
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      "UPS rating response is empty",
      {
        code: "UPS_EMPTY_RESPONSE",
      },
    );
  }

  const body = raw as UpsRateResponseEnvelope;
  const rateResponse = body.RateResponse;
  if (!rateResponse) {
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      "UPS rating response missing RateResponse",
      { code: "UPS_MISSING_RATE_ROOT" },
    );
  }

  const statusCode = rateResponse.Response?.ResponseStatus?.Code?.trim();

  const description = rateResponse.Response?.ResponseStatus?.Description;

  if (
    statusCode !== undefined &&
    statusCode !== "" &&
    statusCode !== UPS_RESPONSE_SUCCESS_CODE
  ) {
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      "UPS rating request was not successful",
      {
        code: "UPS_RESPONSE_STATUS_ERROR",
        details: {
          ResponseStatusCode: statusCode,
          ResponseStatusDescription: description,
        },
      },
    );
  }

  const ratedShipments = normalizeRatedShipments(rateResponse.RatedShipment);
  if (ratedShipments.length === 0) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, "UPS rated no shipments", {
      code: "UPS_NO_RATED_SHIPMENT",
    });
  }

  const first = ratedShipments[0]!;
  const charges = primaryCharges(first);

  const rate = parsePositiveAmount(charges?.MonetaryValue, "UPS rate amount");
  const currency =
    coerceCurrency(charges?.CurrencyCode) ??
    coerceCurrency(first.TransportationCharges?.CurrencyCode);

  const estimatedDeliveryDays = deriveEstimatedDeliveryDays(first) ?? 1;

  return {
    rate,
    provider_name: UPS_PROVIDER_NAME,
    currency: currency ?? "USD",
    estimated_delivery_days: estimatedDeliveryDays,
  };
}

function normalizeRatedShipments(
  raw: UpsRatedShipment | UpsRatedShipment[] | undefined,
): UpsRatedShipment[] {
  if (raw == null) {
    return [];
  }
  return Array.isArray(raw) ? raw : [raw];
}

function primaryCharges(
  shipment: UpsRatedShipment,
): UpsMonetaryCharges | undefined {
  const total = shipment.TotalCharges;
  const hasTotal =
    total?.MonetaryValue != null && String(total.MonetaryValue).trim() !== "";
  if (hasTotal) {
    return total;
  }
  return shipment.TransportationCharges ?? total;
}

function deriveEstimatedDeliveryDays(
  shipment: UpsRatedShipment,
): number | undefined {
  const g = shipment.GuaranteedDelivery?.BusinessDaysInTransit;
  const ea = shipment.TimeInTransit?.ServiceSummary?.EstimatedArrival;
  return (
    coercePositiveOptionalInt(g) ??
    coercePositiveOptionalInt(ea?.BusinessDaysInTransit) ??
    coercePositiveOptionalInt(ea?.TotalTransitDays)
  );
}

function parsePositiveAmount(raw: string | undefined, ctx: string): number {
  if (raw == null || raw === "") {
    throw new ApiError(StatusCodes.BAD_GATEWAY, `${ctx} is missing`, {
      code: "UPS_MISSING_AMOUNT",
    });
  }

  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, `${ctx} is invalid`, {
      code: "UPS_INVALID_AMOUNT",
      details: { raw },
    });
  }

  return n;
}

function coerceCurrency(code: string | undefined): string | undefined {
  if (code == null || code.trim() === "") {
    return undefined;
  }

  return code.trim();
}

function coercePositiveOptionalInt(
  raw: string | undefined,
): number | undefined {
  if (raw == null || raw === "") {
    return undefined;
  }

  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    return undefined;
  }

  return n;
}
