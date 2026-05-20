/** Prefer `StatusCodes` / `ReasonPhrases` instead of numeric literals for HTTP semantics. */
export { ReasonPhrases, StatusCodes } from "http-status-codes";

export const SERVICE_PREFERENCES = {
  EXPRESS: "express",
  STANDARD: "standard",
  ECONOMY: "economy",
} as const;

export const SHIPPING_PROVIDERS = {
  UPS: "ups",
  FEDEX: "fedex",
  USPS: "usps",
} as const;
