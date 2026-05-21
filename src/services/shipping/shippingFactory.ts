import { config } from "../../config/config";
import { BaseShippingProvider } from "./providers/baseShippingProvider";
import { UpsAuthManager } from "./providers/ups/upsAuthManager";
import { UpsShippingProvider } from "./providers/ups/upsShippingProvider";

export class ShippingFactory {
  private static _providers: BaseShippingProvider[] | null = null;

  private constructor() {}

  public static createShippingProviders(): BaseShippingProvider[] {
    // Return cached providers if they exist
    if (this._providers !== null) {
      return this._providers;
    }

    const providers: BaseShippingProvider[] = [];

    if (config.shipping.ups.enabled) {
      // Instantiate the specific auth manager using env secrets
      const upsAuth = new UpsAuthManager(
        config.shipping.ups.clientId,
        config.shipping.ups.secret,
      );

      providers.push(new UpsShippingProvider(upsAuth));
    }

    // if (config.shipping.fedex.enabled) {
    //   providers.push(new FedexShippingProvider());
    // }

    // Cache providers
    this._providers = providers;
    return this._providers;
  }
}
