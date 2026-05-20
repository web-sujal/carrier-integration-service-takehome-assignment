import axios from "axios";
import { ZodType } from "zod";

import {
  StdShippingRatesReqBody,
  StdShippingRatesResBody,
} from "../../../types";
import { ApiError } from "../../../utils/apiError";
import { StatusCodes } from "../../../utils/constants";

export abstract class BaseShippingProvider {
  // 1. THE TEMPLATE METHOD
  public async getShippingRates(
    reqBody: StdShippingRatesReqBody,
  ): Promise<StdShippingRatesResBody> {
    try {
      // 1. Base class enforces validation using the subclass's specific schema
      // This guarantees validation happens and throws detailed Zod errors if it fails.
      const validData = this.carrierValidationSchema.parse(reqBody);

      const payload = this.transformPayload(validData);

      const url = this.getUrl();
      const headers = await this.getHeaders();

      const res = await this.makeHttpCall(url, payload, headers);

      return this.transformResponse(res);
    } catch (err) {
      // Zod validation errors, Axios network errors, and raw exceptions
      // all get funnelled into the subclass's custom error normalizer.
      throw this.normalizeError(err);
    }
  }

  // 2. ABSTRACT PROPERTIES & METHODS
  // Instead of a method, force the subclass to provide a validation schema.
  // UPS might have a 150lb weight limit schema, USPS might have a 70lb limit schema.
  protected abstract carrierValidationSchema: ZodType<StdShippingRatesReqBody>;
  protected abstract transformPayload(reqBody: StdShippingRatesReqBody): any;

  protected abstract transformResponse(response: any): StdShippingRatesResBody;
  protected abstract normalizeError(error: any): ApiError;

  protected abstract getUrl(): string;
  protected abstract getHeaders(): Promise<Record<string, string> | undefined>;

  // 3. DEFAULT IMPLEMENTATION (Shared logic)
  // Subclasses will just inherit this, but they CAN override it if a specific carrier
  // requires a weird SDK or non-standard HTTP client.
  protected async makeHttpCall(
    url: string,
    payload: any,
    headers: any,
  ): Promise<any> {
    try {
      const response = await axios.post(url, payload, { headers });
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // We throw this so the catch block in the template method catches it,
        // and passes it down to the subclass's normalizeError method.
        throw err;
      }

      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Internal server error",
        {
          details: err,
        },
      );
    }
  }
}
