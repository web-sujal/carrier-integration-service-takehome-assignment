import { Router } from "express";

import { shippingRatesController } from "../../controllers";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../utils/validate";
import { stdShippingRatesReqBodySchema } from "../../validations";

const router = Router();

router.post(
  "/",
  validate(stdShippingRatesReqBodySchema),
  asyncHandler(shippingRatesController.getShippingRates),
);

export default router;
