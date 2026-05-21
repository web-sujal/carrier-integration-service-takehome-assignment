import axios from "axios";
import { ZodType } from "zod";

import { config } from "../../../../config/config.js";
import { ApiError } from "../../../../utils/apiError.js";
import { StatusCodes } from "../../../../utils/constants.js";
import {
  StdShippingRatesReqBody,
  stdShippingRatesReqBodySchema,
  StdShippingRatesResBody,
} from "../../../../validations/index.js";
import { BaseShippingProvider } from "../baseShippingProvider.js";
import { UpsAuthManager } from "./upsAuthManager.js";
import { normalizeUpsProviderError } from "./upsNormalizeError.js";
import { buildUpsRatingRequest } from "./upsRateRequest.js";
import type { UpsRatingRequestPayload } from "./upsRateRequest.types.js";
import { mapUpsRatingResponseToStd } from "./upsRateResponse.js";

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

  protected async getHeaders(): Promise<Record<string, string>> {
    const accessToken = await this._authManager.getValidAccessToken();

    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
  }

  protected normalizeError(error: unknown): ApiError {
    return normalizeUpsProviderError(error);
  }

  protected override async makeHttpCall(payload: unknown): Promise<unknown> {
    try {
      return await super.makeHttpCall(payload);
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === StatusCodes.UNAUTHORIZED
      ) {
        this._authManager.invalidateCachedToken();
        return await super.makeHttpCall(payload);
      }

      throw this.normalizeError(err);
    }
  }
}
