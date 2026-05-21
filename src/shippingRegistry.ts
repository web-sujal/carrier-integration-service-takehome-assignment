import { ShippingFactory } from "./services/shipping/shippingFactory";
import { ShippingManager } from "./services/shipping/shippingManager";

/** Shared runtime wiring — imported by controllers; integration tests typically import `./app`. */
export const availableShippingProviders =
  ShippingFactory.createShippingProviders();

export const shippingManager = new ShippingManager(availableShippingProviders);
