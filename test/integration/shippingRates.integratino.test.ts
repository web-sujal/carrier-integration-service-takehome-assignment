import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";

import { app } from "../../src/app.js";
import {
  replaceShippingManagerForTests,
  restoreDefaultShippingManagerForTests,
} from "../../src/shippingRegistry.js";
import { ShippingManager } from "../../src/services/shipping/shippingManager.js";

describe("Shipping Rates Integration Test", () => {
  it("should return shipping rates", async () => {
    // Arrange
    const payload = {
      origin: "123 Main St, Baltimore MD",
      destination: "456 Elm St, Atlanta GA",
      package_type: "box",
      dimensions: { length: 10, width: 8, height: 6 },
      weight: 5,
      service_preference: "standard",
    };

    // Act
    const res = await request(app).post("/api/v1/shipping-rates").send(payload);

    // Assert
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({
      data: [
        {
          rate: 42.99,
          provider_name: "UPS",
          currency: "USD",
          estimated_delivery_days: 3,
        },
      ],
    });
  });

  it("should return 400 if payload is invalid", async () => {
    // Arrange
    const payload = {
      origin: "123 Main St, Baltimore MD",
      destination: "456 Elm St, Atlanta GA",
      package_type: "box",
    };

    // Act
    const res = await request(app).post("/api/v1/shipping-rates").send(payload);

    // Assert
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    expect(res.body.error.message).toEqual("Invalid request payload");
  });

  describe("when no providers are configured", () => {
    afterEach(() => {
      restoreDefaultShippingManagerForTests();
    });

    it("should return 400 when no shipping providers are available", async () => {
      replaceShippingManagerForTests(new ShippingManager([]));

      const payload = {
        origin: "123 Main St, Baltimore MD",
        destination: "456 Elm St, Atlanta GA",
        package_type: "box",
        dimensions: { length: 10, width: 8, height: 6 },
        weight: 5,
        service_preference: "standard",
      };

      const res = await request(app)
        .post("/api/v1/shipping-rates")
        .send(payload);

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.error.message).toEqual("No shipping providers available");
    });
  });
});
