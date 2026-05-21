import { ApiError } from "../../utils/apiError";
import { StatusCodes } from "../../utils/constants";
import {
  StdShippingRatesReqBody,
  StdShippingRatesResBody,
} from "../../validations";
import { BaseShippingProvider } from "./providers/baseShippingProvider";

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

    console.error("Failed quotes:", failedQuotes);

    return successfulQuotes;
  }
}
