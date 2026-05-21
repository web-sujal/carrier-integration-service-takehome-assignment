import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";

import { app } from "../../src/app.js";
import {
  replaceShippingManagerForTests,
  restoreDefaultShippingManagerForTests,
} from "../../src/shippingRegistry.js";
import { ShippingManager } from "../../src/services/shipping/shippingManager.js";
import { validPayload } from "./shippingRates.integration.test.js";

describe("UPS Auth Integration Test", () => {
  // Reuses cached token
  it("should reuse cached token", async () => {
    // Arrange
    const res = await request(app)
      .post("/api/v1/shipping-rates")
      .send(validPayload);

    // Act
    const res2 = await request(app)
      .post("/api/v1/shipping-rates")
      .send(validPayload);

    // Assert
  });

  // Refreshes token after 401
  it("should refresh token after 401", async () => {
    // Arrange
    const payload = {
      origin: "123 Main St, Baltimore MD",
      destination: "456 Elm St, Atlanta GA",
      package_type: "box",
    };

    // Act

    // Assert
  });

  // refreshed after token expires
  it("should refresh token after token expires", async () => {
    // Arrange
    const payload = {
      origin: "123 Main St, Baltimore MD",
      destination: "456 Elm St, Atlanta GA",
      package_type: "box",
    };

    // Act

    // Assert
  });
});
