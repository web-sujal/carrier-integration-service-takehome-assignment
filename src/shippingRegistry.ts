import { ShippingFactory } from "./services/shipping/shippingFactory.js";
import { ShippingManager } from "./services/shipping/shippingManager.js";

/** Shared runtime wiring — imported by controllers; integration tests typically import `./app`. */
export const availableShippingProviders =
  ShippingFactory.createShippingProviders();

export const shippingManager = new ShippingManager(availableShippingProviders);
