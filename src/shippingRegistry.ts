import { ShippingFactory } from "./services/shipping/shippingFactory.js";
import { ShippingManager } from "./services/shipping/shippingManager.js";

function createDefaultShippingManager(): ShippingManager {
  return new ShippingManager(ShippingFactory.createShippingProviders());
}

/** Shared runtime wiring — imported by controllers; integration tests may swap when NODE_ENV=test. */
export let shippingManager: ShippingManager = createDefaultShippingManager();

/** Temporarily swap the manager (empty providers, mocks, etc.). Only allowed when NODE_ENV=test. */
export function replaceShippingManagerForTests(next: ShippingManager): void {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(
      "replaceShippingManagerForTests is only allowed when NODE_ENV=test",
    );
  }
  shippingManager = next;
}

/** Restore manager built from ShippingFactory (respects env-driven providers). Only when NODE_ENV=test. */
export function restoreDefaultShippingManagerForTests(): void {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(
      "restoreDefaultShippingManagerForTests is only allowed when NODE_ENV=test",
    );
  }
  shippingManager = createDefaultShippingManager();
}
