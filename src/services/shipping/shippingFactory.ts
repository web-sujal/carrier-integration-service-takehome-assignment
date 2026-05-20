import { BaseShippingProvider } from "./providers/baseShippingProvider";
import { UpsShippingProvider } from "./providers/ups/upsShippingProvider";

import { config } from "../../config/config";
import { SHIPPING_PROVIDERS } from "../../utils/constants";

export class ShippingFactory {
  public static createShippingProviders(): BaseShippingProvider[] {
    const providers: BaseShippingProvider[] = [];

    for (const provider of config.shipping.providers) {
      if (provider === SHIPPING_PROVIDERS.UPS) {
        // Instantiate the specific auth manager using env secrets
        // const upsAuth = new UPSAuthManager(
        //   process.env.UPS_CLIENT_ID,
        //   process.env.UPS_SECRET
        // );

        // providers.push(new UpsShippingProvider(upsAuth));
        providers.push(new UpsShippingProvider());
      }

      // if (provider === "fedex") {
      //   providers.push(new FedexShippingProvider());
      // }
    }

    return providers;
  }
}
