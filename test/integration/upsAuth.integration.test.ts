import axios, { type InternalAxiosRequestConfig } from "axios";
import { StatusCodes } from "http-status-codes";
import { afterEach, describe, expect, it, vi } from "vitest";

import { config } from "../../src/config/config.js";
import { UpsAuthManager } from "../../src/services/shipping/providers/ups/upsAuthManager.js";
import { UpsShippingProvider } from "../../src/services/shipping/providers/ups/upsShippingProvider.js";
import type { StdShippingRatesReqBody } from "../../src/types/index.js";
import { validPayload } from "./shippingRates.integration.test.js";

/** Same shape as `createUpsShippingRateStubRouter()` success payload; used as mocked `axios.post` body. */
const upsRatingStubBody = {
  RateResponse: {
    Response: {
      ResponseStatus: { Code: "1", Description: "Success" },
    },
    RatedShipment: [
      {
        TotalCharges: {
          CurrencyCode: "USD",
          MonetaryValue: "42.99",
        },
        GuaranteedDelivery: {
          BusinessDaysInTransit: "3",
        },
      },
    ],
  },
};

function makeUnauthorizedAxiosError() {
  return {
    message: "Request failed with status code 401",
    name: "AxiosError",
    isAxiosError: true,
    response: { status: StatusCodes.UNAUTHORIZED },
    config: {} as InternalAxiosRequestConfig,
    toJSON: () => ({}),
  };
}

describe("UpsAuthManager token cache", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function newUpsAuthManager() {
    return new UpsAuthManager(
      config.shipping.ups.clientId,
      config.shipping.ups.secret,
    );
  }

  it("reuses cached token (_getAccessToken once for two callers)", async () => {
    const upsAuthManager = newUpsAuthManager();
    const spy = vi.spyOn(upsAuthManager as UpsAuthInternals, "_getAccessToken");

    await upsAuthManager.getValidAccessToken();
    await upsAuthManager.getValidAccessToken();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("invalidates cached token after 401 and refetches token on retry", async () => {
    const upsAuthManager = newUpsAuthManager();
    const tokenSpy = vi.spyOn(
      upsAuthManager as UpsAuthInternals,
      "_getAccessToken",
    );

    vi.spyOn(axios, "post")
      .mockRejectedValueOnce(makeUnauthorizedAxiosError())
      .mockResolvedValueOnce({ data: upsRatingStubBody });

    const provider = new UpsShippingProvider(upsAuthManager);
    const quote = await provider.getShippingRates(
      validPayload as StdShippingRatesReqBody,
    );

    expect(quote.rate).toBeCloseTo(42.99);
    expect(quote.provider_name).toBe("UPS");

    expect(tokenSpy).toHaveBeenCalledTimes(2);
  });

  it.todo("refreshes token after token expires");
});

type UpsAuthInternals = UpsAuthManager & {
  _getAccessToken(): Promise<{ access_token: string; expires_in: number }>;
};
