import { Router } from "express";

/**
 * Mimics a minimal UPS Rating success JSON body for dev / take-home mocks.
 */
export function createUpsShippingRateStubRouter(): Router {
  const router = Router();

  router.post("/shipping-rate", (_req, res) => {
    res.status(200).json({
      RateResponse: {
        Response: {
          ResponseStatus: { Code: "1", Description: "Success" },
        },
        RatedShipment: [
          {
            Service: { Code: "03", Description: "Ground (stub)" },
            TotalCharges: {
              CurrencyCode: "USD",
              MonetaryValue: "42.99",
            },
            TransportationCharges: {
              CurrencyCode: "USD",
              MonetaryValue: "42.99",
            },
            GuaranteedDelivery: {
              BusinessDaysInTransit: "3",
            },
          },
        ],
      },
    });
  });

  return router;
}
