import { ZodType } from "zod";

import {
  StdShippingRatesReqBody,
  StdShippingRatesResBody,
} from "../../../types";
import { ApiError } from "../../../utils/apiError";

export abstract class BaseShippingProvider {
  // 1. THE TEMPLATE METHOD
  public async getShippingRates(
    reqBody: StdShippingRatesReqBody,
  ): Promise<StdShippingRatesResBody> {
    try {
      const validData = this.carrierValidationSchema.parse(reqBody);

      const payload = this.transformPayload(validData);

      const url = this.getUrl();
      const res = await this.makeHttpCall(url, payload);

      return this.transformResponse(res);
    } catch (err) {
      // Zod validation errors, Axios network errors, and raw exceptions
      // all get funnelled into the subclass's custom error normalizer.
      throw this.normalizeError(err);
    }
  }

  // 2. ABSTRACT HOOKS (each carrier implements HTTP + headers / auth nuances)
  protected abstract carrierValidationSchema: ZodType<StdShippingRatesReqBody>;
  protected abstract transformPayload(
    reqBody: StdShippingRatesReqBody,
  ): unknown;

  protected abstract transformResponse(
    response: unknown,
  ): StdShippingRatesResBody;
  protected abstract normalizeError(error: unknown): ApiError;

  protected abstract getUrl(): string;

  /** Build headers for the outbound request (e.g. Bearer, content-type). */
  protected abstract getHeaders(): Promise<Record<string, string> | undefined>;

  /** Perform carrier HTTP exchange; callers should use axios + normalize failures per carrier in {@link normalizeError}. */
  protected abstract makeHttpCall(
    url: string,
    payload: unknown,
  ): Promise<unknown>;
}
