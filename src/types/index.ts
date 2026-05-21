import { SERVICE_PREFERENCES } from "../utils/constants.js";

export type ServicePreference =
  (typeof SERVICE_PREFERENCES)[keyof typeof SERVICE_PREFERENCES];

export type PackageType = "box" | (string & {});

import type {
  StdShippingRatesReqBody,
  StdShippingRatesResBody,
} from "../validations/index.js";

export type { StdShippingRatesReqBody, StdShippingRatesResBody };

export type Dimensions = StdShippingRatesReqBody["dimensions"];
