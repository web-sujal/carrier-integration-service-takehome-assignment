import { z } from "zod";

import type { PackageType } from "../types";
import { SERVICE_PREFERENCES } from "../utils/constants";

export const stdShippingRatesReqBodySchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  package_type: z.string().min(1, "Package type is required"),
  dimensions: z.object({
    length: z.number().min(1, "Length is required"),
    width: z.number().min(1, "Width is required"),
    height: z.number().min(1, "Height is required"),
  }),
  weight: z.number().min(1, "Weight is required"),
  service_preference: z.enum(Object.values(SERVICE_PREFERENCES)).optional(),
});

/** Inferred from Zod; `package_type` widened for TS hints via {@link PackageType}. */
export type StdShippingRatesReqBody = Omit<
  z.infer<typeof stdShippingRatesReqBodySchema>,
  "package_type"
> & { package_type: PackageType };

export const stdShippingRatesResBodySchema = z.object({
  rate: z.number().min(1, "Rate is required"),
  provider_name: z.string().min(1, "Provider name is required"),
  currency: z.string().min(1, "Currency is required"),
  estimated_delivery_days: z
    .number()
    .min(1, "Estimated delivery days is required"),
});

export type StdShippingRatesResBody = z.infer<
  typeof stdShippingRatesResBodySchema
>;
