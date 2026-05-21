import { ApiError } from "../../utils/apiError.js";
import { StatusCodes } from "../../utils/constants.js";
import {
  StdShippingRatesReqBody,
  StdShippingRatesResBody,
} from "../../validations/index.js";
import { BaseShippingProvider } from "./providers/baseShippingProvider.js";

export class ShippingManager {
  constructor(private readonly _shippingProviders: BaseShippingProvider[]) {}

  public async getAllShippingRates(
    reqBody: StdShippingRatesReqBody,
  ): Promise<StdShippingRatesResBody[]> {
    if (this._shippingProviders.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "No shipping providers available",
      );
    }

    const settledQuotes = await Promise.allSettled(
      this._shippingProviders.map((provider) =>
        provider.getShippingRates(reqBody),
      ),
    );

    const successfulQuotes = settledQuotes
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    // Log failed quotes
    const failedQuotes = settledQuotes
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason);

    if (failedQuotes.length > 0) {
      console.error("Failed quotes:", failedQuotes);
    }

    return successfulQuotes;
  }
}
