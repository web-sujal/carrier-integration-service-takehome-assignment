import {
  StdShippingRatesReqBody,
  StdShippingRatesResBody,
} from "../../validations";
import { BaseShippingProvider } from "./providers/baseShippingProvider";

export class ShippingManager {
  constructor(private readonly shippingProviders: BaseShippingProvider[]) {}

  public async getAllShippingRates(
    reqBody: StdShippingRatesReqBody,
  ): Promise<StdShippingRatesResBody[]> {
    const quotes = await Promise.all(
      this.shippingProviders.map((provider) =>
        provider.getShippingRates(reqBody),
      ),
    );

    return quotes;
  }
}
