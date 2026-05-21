import axios from "axios";
import { ZodType } from "zod";

import {
  StdShippingRatesReqBody,
  StdShippingRatesResBody,
} from "../../../types/index.js";
import { ApiError } from "../../../utils/apiError.js";

export abstract class BaseShippingProvider {
  // 1. THE TEMPLATE METHOD
  public async getShippingRates(
    reqBody: StdShippingRatesReqBody,
  ): Promise<StdShippingRatesResBody> {
    try {
      const validData = this.carrierValidationSchema.parse(reqBody);

      const payload = this.transformPayload(validData);

      const res = await this.makeHttpCall(payload);

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

  protected abstract getHeaders(): Promise<Record<string, string> | undefined>;

  protected async makeHttpCall(payload: unknown): Promise<unknown> {
    return this.executeWithRetry(async () => {
      const url = this.getUrl();
      const headers = await this.getHeaders();

      const { data } = await axios.post(url, payload, {
        headers,
        timeout: 5000,
      });

      return data;
    });
  }

  /** Execute an operation with retry logic. */
  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    const MAX_ATTEMPTS = 3;
    const BASE_DELAY_MS = 2000;

    for (let attempt = 0; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return await operation();
      } catch (err: any) {
        const status = err?.response?.status;

        const isTimeout = err?.code === "ECONNABORTED";

        const isRetryable5xx = [500, 502, 503, 504].includes(status);

        const isRateLimited = status === 429;

        const shouldRetry = isTimeout || isRetryable5xx || isRateLimited;

        if (!shouldRetry || attempt === MAX_ATTEMPTS) {
          throw err;
        }

        let delayMs: number;

        // Respect Retry-After header if present
        const retryAfter = err?.response?.headers?.["retry-after"];

        if (retryAfter) {
          delayMs = Number(retryAfter) * 1000;
        } else {
          // exponential backoff
          delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
        }

        // jitter: -500ms to +500ms
        const jitter = Math.floor(Math.random() * 1000) - 500;

        delayMs += jitter;

        delayMs = Math.max(delayMs, 0);

        // sleep
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw new Error("Unreachable retry state");
  }
}
