import { ZodType } from "zod";

import { config } from "../../../../config/config";
import { ApiError } from "../../../../utils/apiError";
import {
  StdShippingRatesReqBody,
  stdShippingRatesReqBodySchema,
  StdShippingRatesResBody,
} from "../../../../validations";
import { BaseShippingProvider } from "../baseShippingProvider";
import { UpsAuthManager } from "./upsAuthManager";
import { normalizeUpsProviderError } from "./upsNormalizeError";
import { buildUpsRatingRequest } from "./upsRateRequest";
import type { UpsRatingRequestPayload } from "./upsRateRequest.types";
import { mapUpsRatingResponseToStd } from "./upsRateResponse";

export class UpsShippingProvider extends BaseShippingProvider {
  constructor(private readonly _authManager: UpsAuthManager) {
    super();
  }

  protected carrierValidationSchema: ZodType<StdShippingRatesReqBody> =
    stdShippingRatesReqBodySchema;

  protected transformPayload(
    reqBody: StdShippingRatesReqBody,
  ): UpsRatingRequestPayload {
    return buildUpsRatingRequest(reqBody);
  }

  protected transformResponse(response: unknown): StdShippingRatesResBody {
    return mapUpsRatingResponseToStd(response);
  }

  protected getUrl(): string {
    return `http://127.0.0.1:${config.server.port}/internal/stub/ups/shipping-rate`;
  }

  protected getHeaders(): Promise<Record<string, string>> {
    return Promise.resolve({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
  }

  protected normalizeError(error: unknown): ApiError {
    return normalizeUpsProviderError(error);
  }
}
